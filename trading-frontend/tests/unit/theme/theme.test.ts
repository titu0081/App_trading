import { resolveThemeMode } from '@/shared/theme';

describe('resolveThemeMode', () => {
  it('uses the device mode when preference is system', () => {
    expect(resolveThemeMode('system', 'dark')).toBe('dark');
    expect(resolveThemeMode('system', null)).toBe('light');
  });

  it('uses an explicit preference regardless of device mode', () => {
    expect(resolveThemeMode('light', 'dark')).toBe('light');
    expect(resolveThemeMode('dark', 'light')).toBe('dark');
  });
});