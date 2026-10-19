import { weatherThemes } from '@/styles/themes';

function relativeLuminance(color: string): number {
  const channels = color.match(/[a-f\d]{2}/gi)?.map((channel) => parseInt(channel, 16) / 255);

  if (!channels || channels.length !== 3) {
    throw new Error(`Unsupported color: ${color}`);
  }

  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
  const luminances = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (left, right) => right - left,
  );
  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
}

describe('weather theme contrast', () => {
  it.each(Object.entries(weatherThemes))(
    '%s maintains WCAG AA contrast on its card surface',
    (_condition, theme) => {
      expect(contrastRatio(theme.text, theme.card)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(theme.muted, theme.card)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(theme.accent, theme.card)).toBeGreaterThanOrEqual(4.5);
      theme.gradientColors.forEach((background) => {
        expect(contrastRatio(theme.text, background)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(theme.muted, background)).toBeGreaterThanOrEqual(4.5);
      });
    },
  );
});
