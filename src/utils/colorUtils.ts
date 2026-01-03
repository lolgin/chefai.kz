/**
 * colorUtils.ts
 * 
 * Утилиты для работы с цветами
 * - Генерация случайных цветов
 * - Генерация гармоничных палитр
 * - Конвертация форматов
 */

export const generateRandomColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.random() * 30; // 60-90%
  const lightness = 50 + Math.random() * 20; // 50-70%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const generateComplementaryColor = (baseColor: string): string => {
  // Простая инверсия HSL
  const match = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return baseColor;
  
  const hue = (parseInt(match[1]) + 180) % 360;
  return `hsl(${hue}, ${match[2]}%, ${match[3]}%)`;
};

export const generateAnalogousColors = (baseColor: string, count: number = 3): string[] => {
  const match = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return [baseColor];
  
  const baseHue = parseInt(match[1]);
  const sat = match[2];
  const light = match[3];
  
  return Array.from({ length: count }, (_, i) => {
    const hue = (baseHue + (i - Math.floor(count / 2)) * 30 + 360) % 360;
    return `hsl(${hue}, ${sat}%, ${light}%)`;
  });
};

export const generateTriadicColors = (baseColor: string): string[] => {
  const match = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return [baseColor];
  
  const baseHue = parseInt(match[1]);
  const sat = match[2];
  const light = match[3];
  
  return [
    baseColor,
    `hsl(${(baseHue + 120) % 360}, ${sat}%, ${light}%)`,
    `hsl(${(baseHue + 240) % 360}, ${sat}%, ${light}%)`
  ];
};

export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
};

export const getRandomGradient = (): string => {
  const color1 = generateRandomColor();
  const color2 = generateRandomColor();
  const angle = Math.floor(Math.random() * 360);
  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
};

// Генерация пастельных цветов для светлых тем
export const generatePastelColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 40 + Math.random() * 30; // 40-70%
  const lightness = 75 + Math.random() * 15; // 75-90%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Генерация неоновых цветов для темных тем
export const generateNeonColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 80 + Math.random() * 20; // 80-100%
  const lightness = 50 + Math.random() * 20; // 50-70%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Генерация гармоничной палитры из 5 цветов
export const generateHarmoniousPalette = (isLight: boolean = true): string[] => {
  const baseHue = Math.floor(Math.random() * 360);
  const satRange = isLight ? [40, 60] : [70, 90];
  const lightRange = isLight ? [75, 90] : [45, 65];
  
  return [
    `hsl(${baseHue}, ${satRange[0] + Math.random() * (satRange[1] - satRange[0])}%, ${lightRange[0] + Math.random() * (lightRange[1] - lightRange[0])}%)`,
    `hsl(${(baseHue + 30) % 360}, ${satRange[0] + Math.random() * (satRange[1] - satRange[0])}%, ${lightRange[0] + Math.random() * (lightRange[1] - lightRange[0])}%)`,
    `hsl(${(baseHue + 120) % 360}, ${satRange[0] + Math.random() * (satRange[1] - satRange[0])}%, ${lightRange[0] + Math.random() * (lightRange[1] - lightRange[0])}%)`,
    `hsl(${(baseHue + 180) % 360}, ${satRange[0] + Math.random() * (satRange[1] - satRange[0])}%, ${lightRange[0] + Math.random() * (lightRange[1] - lightRange[0])}%)`,
    `hsl(${(baseHue + 240) % 360}, ${satRange[0] + Math.random() * (satRange[1] - satRange[0])}%, ${lightRange[0] + Math.random() * (lightRange[1] - lightRange[0])}%)`
  ];
};
