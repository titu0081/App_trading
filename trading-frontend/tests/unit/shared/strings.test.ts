import { strings } from '@/shared/constants/strings';

describe('centralized strings', () => {
  it('formats watchlist asset counts in one place', () => {
    expect(strings.watchlists.assetCount(1)).toBe('1 activo');
    expect(strings.watchlists.assetCount(2)).toBe('2 activos');
  });

  it('formats the profile user identifier label in one place', () => {
    expect(strings.profile.userIdValue('user-1')).toBe('ID de usuario: user-1');
  });
});
