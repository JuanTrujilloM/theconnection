import {
  BadRequestException,
  GoneException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { MatchesService } from '../matches/matches.service';
import {
  AvailabilityLinkService,
  LinkValidation,
} from '../availability-link/availability-link.service';
import { AvailabilityService } from './availability.service';
import { TIME_SLOTS } from './availability.constants';

const OK_AVAILABILITY: LinkValidation = {
  status: 'ok',
  link: { id: 'link-0', matchId: 'm1', userId: 'u1', step: 'AVAILABILITY' },
};

function setup() {
  const createMany = jest.fn().mockResolvedValue({ count: 1 });
  const deleteMany = jest.fn().mockResolvedValue({ count: 0 });
  const prisma = {
    availability: { createMany, deleteMany },
    // Service passes an array of prisma ops; run them like a real transaction.
    $transaction: (ops: Promise<unknown>[]) => Promise.all(ops),
    match: {
      findUnique: jest.fn().mockResolvedValue({
        userAId: 'u1',
        userBId: 'u2',
        userA: { profile: { name: 'Ana' } },
        userB: { profile: { name: 'Beto' } },
      }),
    },
  } as unknown as PrismaService;

  const links = {
    validate: jest.fn(),
    advanceToVenue: jest.fn().mockResolvedValue(undefined),
    consume: jest.fn().mockResolvedValue(undefined),
  };
  const matches = {
    getVenueSuggestions: jest.fn().mockResolvedValue([]),
    selectVenues: jest.fn().mockResolvedValue({
      selectedVenueIds: ['v1'],
      venueSelectionPending: false,
    }),
  };

  const service = new AvailabilityService(
    prisma,
    links as unknown as AvailabilityLinkService,
    matches as unknown as MatchesService,
  );
  return { service, links, matches, createMany, deleteMany };
}

describe('AvailabilityService', () => {
  describe('getAvailabilityView', () => {
    it('returns 7 days and the fixed 12pm–7pm slots', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue(OK_AVAILABILITY);

      const view = await service.getAvailabilityView('t');
      if (view.step !== 'AVAILABILITY') throw new Error('expected calendar');
      expect(view.days).toHaveLength(7);
      expect(view.timeSlots).toEqual([...TIME_SLOTS]);
      expect(view.partnerName).toBe('Beto'); // partner of u1
    });

    it('signals a redirect when the link is already on the VENUE step', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue({
        status: 'ok',
        link: { ...OK_AVAILABILITY.link, step: 'VENUE' },
      });
      expect(await service.getAvailabilityView('t')).toEqual({ step: 'VENUE' });
    });

    it('maps an expired link to 410 Gone (AC #5)', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue({ status: 'expired' });
      await expect(service.getAvailabilityView('t')).rejects.toThrow(
        GoneException,
      );
    });

    it('maps an unknown link to 404 (AC #5)', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue({ status: 'invalid' });
      await expect(service.getAvailabilityView('t')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('submitAvailability', () => {
    // Grabs a real in-window date from the generated calendar.
    async function validDate(service: AvailabilityService): Promise<string> {
      const view = await service.getAvailabilityView('t');
      if (view.step !== 'AVAILABILITY') throw new Error('expected calendar');
      return view.days[0].date;
    }

    it('saves the slots and advances the link to the venue step', async () => {
      const { service, links, createMany } = setup();
      links.validate.mockResolvedValue(OK_AVAILABILITY);
      const date = await validDate(service);

      type SavedRow = {
        matchId: string;
        userId: string;
        date: Date;
        timeSlot: string;
      };
      let savedRows: SavedRow[] = [];
      createMany.mockImplementation((args: { data: SavedRow[] }) => {
        savedRows = args.data;
        return Promise.resolve({ count: args.data.length });
      });

      const result = await service.submitAvailability('t', [
        { date, timeSlot: '12:00' },
        { date, timeSlot: '13:00' },
      ]);

      expect(result).toEqual({ step: 'VENUE' });
      expect(savedRows).toHaveLength(2);
      expect(savedRows.map((row) => row.timeSlot)).toEqual(['12:00', '13:00']);
      expect(savedRows.every((row) => row.date instanceof Date)).toBe(true);
      expect(
        savedRows.every((row) => row.matchId === 'm1' && row.userId === 'u1'),
      ).toBe(true);
      expect(links.advanceToVenue).toHaveBeenCalledWith('link-0');
    });

    it('rejects a day outside the 7-day window', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue(OK_AVAILABILITY);
      await expect(
        service.submitAvailability('t', [
          { date: '2000-01-01', timeSlot: '12:00' },
        ]),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects an unknown time slot', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue(OK_AVAILABILITY);
      const date = await validDate(service);
      await expect(
        service.submitAvailability('t', [{ date, timeSlot: '09:00' }]),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects duplicate slots', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue(OK_AVAILABILITY);
      const date = await validDate(service);
      await expect(
        service.submitAvailability('t', [
          { date, timeSlot: '12:00' },
          { date, timeSlot: '12:00' },
        ]),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a second submit on an already-used link (AC #5)', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue({
        status: 'ok',
        link: { ...OK_AVAILABILITY.link, step: 'VENUE' },
      });
      await expect(
        service.submitAvailability('t', [
          { date: '2000-01-01', timeSlot: '12:00' },
        ]),
      ).rejects.toThrow(GoneException);
    });
  });

  describe('selectVenues', () => {
    it('records the choice via MatchesService and consumes the link', async () => {
      const { service, links, matches } = setup();
      links.validate.mockResolvedValue({
        status: 'ok',
        link: { ...OK_AVAILABILITY.link, step: 'VENUE' },
      });

      const result = await service.selectVenues('t', ['v1', 'v2']);

      expect(matches.selectVenues).toHaveBeenCalledWith('u1', ['v1', 'v2']);
      expect(links.consume).toHaveBeenCalledWith('link-0');
      expect(result).toMatchObject({ step: 'COMPLETED' });
    });
  });
});
