import { PrismaService } from '../../../../config/prisma.service';
import { GetMatchDetailsTool } from './get-match-details.tool';

interface MatchOutput {
  name: string;
  university: string;
  major: string;
  bio: string;
  status: string;
}

describe('GetMatchDetailsTool', () => {
  const findFirst = jest.fn();
  const prisma = { match: { findFirst } } as unknown as PrismaService;
  const tool = new GetMatchDetailsTool(prisma);

  beforeEach(() => findFirst.mockReset());

  it('returns NO_ACTIVE_MATCH when there is none', async () => {
    findFirst.mockResolvedValue(null);
    expect(await tool.run('u1')).toBe('NO_ACTIVE_MATCH');
  });

  it('returns only the partner public fields with a mapped status', async () => {
    findFirst.mockResolvedValue({
      userAId: 'u1',
      userBId: 'u2',
      status: 'confirmed',
      userA: { profile: { name: 'Me' } },
      userB: {
        profile: {
          name: 'Sofía',
          university: 'CES',
          major: 'Medicina',
          biography: 'Amante del café',
          // Fields below must NOT leak into the tool output.
        },
      },
      date: { status: 'confirmed' },
    });

    const output = JSON.parse(await tool.run('u1')) as MatchOutput;

    expect(output).toEqual({
      name: 'Sofía',
      university: 'CES',
      major: 'Medicina',
      bio: 'Amante del café',
      status: 'Cita agendada',
    });
  });

  it('picks the other side when the user is userB', async () => {
    findFirst.mockResolvedValue({
      userAId: 'u2',
      userBId: 'u1',
      status: 'pending',
      userA: {
        profile: {
          name: 'Sofía',
          university: 'CES',
          major: 'Medicina',
          biography: 'Hola',
        },
      },
      userB: { profile: { name: 'Me' } },
      date: null,
    });

    const output = JSON.parse(await tool.run('u1')) as MatchOutput;

    expect(output.name).toBe('Sofía');
    expect(output.status).toBe('Pendiente de aceptación');
  });
});
