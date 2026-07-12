import {
  BadRequestException,
  GoneException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { MatchesService } from '../matches/matches.service';
import { MatchConfirmationService } from '../matches/match-confirmation.service';
import {
  AvailabilityLinkService,
  LinkValidation,
} from '../availability-link/availability-link.service';
import { AvailabilityService } from './availability.service';
import { TIME_SLOTS } from './availability.constants';

// Flow order: VENUE (places, step 1) -> AVAILABILITY (slots, step 2) -> consumed.
const OK_VENUE: LinkValidation = {
  status: 'ok',
  link: { id: 'link-0', matchId: 'm1', userId: 'u1', step: 'VENUE' },
};
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
    setStep: jest.fn().mockResolvedValue(undefined),
    consume: jest.fn().mockResolvedValue(undefined),
  };
  const matches = {
    getVenueSuggestions: jest.fn().mockResolvedValue([]),
    selectVenues: jest.fn().mockResolvedValue({ selectedVenueIds: ['v1'] }),
  };
  const confirmation = {
    tryConfirm: jest.fn().mockResolvedValue('waiting'),
  };

  const service = new AvailabilityService(
    prisma,
    links as unknown as AvailabilityLinkService,
    matches as unknown as MatchesService,
    confirmation as unknown as MatchConfirmationService,
  );
  return { service, links, matches, confirmation, createMany, deleteMany };
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

    it('signals a redirect when places are not chosen yet (VENUE step)', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue(OK_VENUE);
      expect(await service.getAvailabilityView('t')).toEqual({ step: 'VENUE' });
    });

    it('reports a consumed link as COMPLETED instead of an error', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue({ status: 'consumed' });
      expect(await service.getAvailabilityView('t')).toEqual({
        step: 'COMPLETED',
      });
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

    it('saves the slots, consumes the link, and triggers confirmation', async () => {
      const { service, links, confirmation, createMany } = setup();
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

      expect(result).toEqual({ step: 'COMPLETED' });
      expect(savedRows).toHaveLength(2);
      expect(savedRows.map((row) => row.timeSlot)).toEqual(['12:00', '13:00']);
      expect(savedRows.every((row) => row.date instanceof Date)).toBe(true);
      expect(
        savedRows.every((row) => row.matchId === 'm1' && row.userId === 'u1'),
      ).toBe(true);
      expect(links.consume).toHaveBeenCalledWith('link-0');
      expect(confirmation.tryConfirm).toHaveBeenCalledWith('m1');
    });

    it('does not fail the save when the confirmation check throws', async () => {
      const { service, links, confirmation } = setup();
      links.validate.mockResolvedValue(OK_AVAILABILITY);
      confirmation.tryConfirm.mockRejectedValue(new Error('boom'));
      const date = await validDate(service);

      const result = await service.submitAvailability('t', [
        { date, timeSlot: '12:00' },
      ]);
      expect(result).toEqual({ step: 'COMPLETED' });
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

    it('rejects a submit before places are chosen (VENUE step)', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue(OK_VENUE);
      await expect(
        service.submitAvailability('t', [
          { date: '2000-01-01', timeSlot: '12:00' },
        ]),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a submit on a consumed link (AC #5)', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue({ status: 'consumed' });
      await expect(
        service.submitAvailability('t', [
          { date: '2000-01-01', timeSlot: '12:00' },
        ]),
      ).rejects.toThrow(GoneException);
    });
  });

  describe('getVenuesView', () => {
    it('serves the suggestions on the VENUE step (step 1)', async () => {
      const { service, links, matches } = setup();
      links.validate.mockResolvedValue(OK_VENUE);
      matches.getVenueSuggestions.mockResolvedValue([{ id: 'v1' }]);

      const view = await service.getVenuesView('t');
      if (view.step !== 'VENUE') throw new Error('expected venues');
      expect(view.venues).toEqual([{ id: 'v1' }]);
      expect(view.partnerName).toBe('Beto');
      expect(matches.getVenueSuggestions).toHaveBeenCalledWith('u1');
    });

    it('signals a redirect when places are already chosen (AVAILABILITY step)', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue(OK_AVAILABILITY);
      expect(await service.getVenuesView('t')).toEqual({
        step: 'AVAILABILITY',
      });
    });

    it('reports a consumed link as COMPLETED instead of an error', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue({ status: 'consumed' });
      expect(await service.getVenuesView('t')).toEqual({ step: 'COMPLETED' });
    });
  });

  describe('selectVenues', () => {
    it('records the choice and advances the link to the availability step', async () => {
      const { service, links, matches } = setup();
      links.validate.mockResolvedValue(OK_VENUE);

      const result = await service.selectVenues('t', ['v1', 'v2']);

      expect(matches.selectVenues).toHaveBeenCalledWith('u1', ['v1', 'v2']);
      expect(links.setStep).toHaveBeenCalledWith('link-0', 'AVAILABILITY');
      expect(links.consume).not.toHaveBeenCalled();
      expect(result).toMatchObject({ step: 'AVAILABILITY' });
    });

    it('rejects a second selection once past the VENUE step', async () => {
      const { service, links } = setup();
      links.validate.mockResolvedValue(OK_AVAILABILITY);
      await expect(service.selectVenues('t', ['v1', 'v2'])).rejects.toThrow(
        GoneException,
      );
    });
  });
});
