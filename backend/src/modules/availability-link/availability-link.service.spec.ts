import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { AvailabilityLinkService } from './availability-link.service';

interface Row {
  id: string;
  matchId: string;
  userId: string;
  tokenHash: string;
  step: string;
  expiresAt: Date;
  consumedAt: Date | null;
}

// In-memory availabilityLink table just rich enough for the service's queries.
function makeStore(ttlHours = '72') {
  const rows: Row[] = [];
  const prisma = {
    availabilityLink: {
      deleteMany: ({
        where,
      }: {
        where: { matchId: string; userId: string };
      }) => {
        for (let i = rows.length - 1; i >= 0; i--) {
          if (
            rows[i].matchId === where.matchId &&
            rows[i].userId === where.userId
          ) {
            rows.splice(i, 1);
          }
        }
        return Promise.resolve({ count: 0 });
      },
      create: ({ data }: { data: Omit<Row, 'id' | 'step' | 'consumedAt'> }) => {
        const row: Row = {
          id: `link-${rows.length}`,
          step: 'AVAILABILITY',
          consumedAt: null,
          ...data,
        };
        rows.push(row);
        return Promise.resolve(row);
      },
      findUnique: ({ where }: { where: { tokenHash: string } }) =>
        Promise.resolve(
          rows.find((r) => r.tokenHash === where.tokenHash) ?? null,
        ),
      update: ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<Row>;
      }) => {
        const row = rows.find((r) => r.id === where.id)!;
        Object.assign(row, data);
        return Promise.resolve(row);
      },
      updateMany: ({
        where,
        data,
      }: {
        where: { id: string; consumedAt?: null };
        data: Partial<Row>;
      }) => {
        let count = 0;
        for (const row of rows) {
          const matchesConsumed =
            where.consumedAt === undefined ||
            row.consumedAt === where.consumedAt;
          if (row.id === where.id && matchesConsumed) {
            Object.assign(row, data);
            count += 1;
          }
        }
        return Promise.resolve({ count });
      },
    },
  } as unknown as PrismaService;

  const config = {
    get: () => ttlHours,
  } as unknown as ConfigService;

  return { service: new AvailabilityLinkService(prisma, config), rows };
}

describe('AvailabilityLinkService', () => {
  it('stores only the hash, never the plaintext token', async () => {
    const { service, rows } = makeStore();
    const token = await service.issueForMatchUser('m1', 'u1');
    expect(rows).toHaveLength(1);
    expect(rows[0].tokenHash).not.toBe(token);
    expect(rows[0].tokenHash).toHaveLength(64); // sha256 hex
  });

  it('validates a fresh token as ok with its match/user', async () => {
    const { service } = makeStore();
    const token = await service.issueForMatchUser('m1', 'u1');
    const result = await service.validate(token);
    expect(result).toEqual({
      status: 'ok',
      link: {
        id: 'link-0',
        matchId: 'm1',
        userId: 'u1',
        step: 'AVAILABILITY',
      },
    });
  });

  it('reports an unknown token as invalid', async () => {
    const { service } = makeStore();
    expect(await service.validate('nope')).toEqual({ status: 'invalid' });
  });

  it('reports an expired token as expired', async () => {
    const { service } = makeStore('-1'); // TTL in the past
    const token = await service.issueForMatchUser('m1', 'u1');
    expect(await service.validate(token)).toEqual({ status: 'expired' });
  });

  it('reports a consumed token as consumed (single use)', async () => {
    const { service } = makeStore();
    const token = await service.issueForMatchUser('m1', 'u1');
    const ok = await service.validate(token);
    if (ok.status !== 'ok') throw new Error('expected ok');
    await service.consume(ok.link.id);
    expect(await service.validate(token)).toEqual({ status: 'consumed' });
  });

  it('re-issuing replaces the previous link for the same match/user', async () => {
    const { service, rows } = makeStore();
    const first = await service.issueForMatchUser('m1', 'u1');
    await service.issueForMatchUser('m1', 'u1');
    expect(rows).toHaveLength(1);
    expect(await service.validate(first)).toEqual({ status: 'invalid' });
  });

  it('advances the step to VENUE', async () => {
    const { service } = makeStore();
    const token = await service.issueForMatchUser('m1', 'u1');
    const ok = await service.validate(token);
    if (ok.status !== 'ok') throw new Error('expected ok');
    await service.advanceToVenue(ok.link.id);
    const after = await service.validate(token);
    expect(after).toMatchObject({ status: 'ok', link: { step: 'VENUE' } });
  });
});
