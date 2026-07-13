import { PrismaService } from '../../../config/prisma.service';
import { UserResolverService } from './user-resolver.service';

describe('UserResolverService', () => {
  const findUnique = jest.fn();
  const prisma = { user: { findUnique } } as unknown as PrismaService;
  const service = new UserResolverService(prisma);

  beforeEach(() => findUnique.mockReset());

  it('returns unregistered when the number is unknown', async () => {
    findUnique.mockResolvedValue(null);
    expect(await service.resolve('+57300')).toEqual({ status: 'unregistered' });
  });

  it('returns unverified when the account is not verified', async () => {
    findUnique.mockResolvedValue({
      id: 'u1',
      isVerified: false,
      profile: null,
      preferences: null,
    });
    expect(await service.resolve('+57300')).toEqual({ status: 'unverified' });
  });

  it('builds a chat context for a verified user', async () => {
    findUnique.mockResolvedValue({
      id: 'u1',
      isVerified: true,
      profile: {
        name: 'Ana',
        dateOfBirth: new Date('2000-01-01'),
        university: 'EAFIT',
        major: 'Derecho',
        semester: '5',
        hobbies: [
          { hobby: { name: 'Cine' } },
          { hobby: { name: 'Senderismo' } },
        ],
      },
      preferences: {
        relationshipType: 'Seria',
        orientation: 'Heterosexual',
        energyVibe: 'Tranquila',
      },
    });

    const result = await service.resolve('+57300');

    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.userId).toBe('u1');
      expect(result.context.name).toBe('Ana');
      expect(result.context.interests).toEqual(['Cine', 'Senderismo']);
      expect(result.context.relationshipType).toBe('Seria');
      expect(result.context.age).toBeGreaterThan(20);
    }
  });
});
