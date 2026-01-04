/**
 * cloudLayoutGenerators.ts
 * 
 * Генераторы позиций для 5 типов облаков тегов:
 * - sphere: сферическое распределение (Fibonacci sphere)
 * - cube: кубическое распределение по 6 граням
 * - spiral: логарифмическая спираль
 * - grid: плоская сетка с вариацией по Z
 * - wave: синусоидальная волна
 */

export interface CloudItem {
  data: any;
  x: number;
  y: number;
  z: number;
  size: number;
}

export type CloudLayoutGenerator = (items: any[], radius: number) => CloudItem[];

/**
 * Сферическое распределение (Fibonacci sphere)
 * Равномерное распределение точек по поверхности сферы
 */
export const generateSpherePositions: CloudLayoutGenerator = (items, radius = 300) => {
  return items.map((item, i) => {
    const phi = Math.acos(-1 + (2 * i) / items.length);
    const theta = Math.sqrt(items.length * Math.PI) * phi;
    return {
      data: item,
      x: radius * Math.cos(theta) * Math.sin(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
      z: radius * Math.cos(phi),
      size: 0.7 + Math.random() * 0.6
    };
  });
};

/**
 * Кубическое распределение
 * Равномерно по 6 граням куба
 */
export const generateCubePositions: CloudLayoutGenerator = (items, size = 300) => {
  const half = size / 2;
  return items.map((item, i) => {
    const face = i % 6; // 6 граней куба
    const u = Math.random() * size - half;
    const v = Math.random() * size - half;
    
    let x = 0, y = 0, z = 0;
    switch(face) {
      case 0: x = half; y = u; z = v; break;   // правая грань
      case 1: x = -half; y = u; z = v; break;  // левая грань
      case 2: y = half; x = u; z = v; break;   // верхняя грань
      case 3: y = -half; x = u; z = v; break;  // нижняя грань
      case 4: z = half; x = u; y = v; break;   // передняя грань
      case 5: z = -half; x = u; y = v; break;  // задняя грань
    }
    
    return {
      data: item,
      x, y, z,
      size: 0.7 + Math.random() * 0.6
    };
  });
};

/**
 * Спиральное распределение
 * Логарифмическая спираль в 3D
 */
export const generateSpiralPositions: CloudLayoutGenerator = (items, radius = 300) => {
  return items.map((item, i) => {
    const t = i / items.length;
    const angle = t * Math.PI * 8; // 4 витка спирали
    const r = radius * (0.3 + t * 0.7); // радиус увеличивается от центра
    const height = (t - 0.5) * radius * 2; // высота от -radius до +radius
    
    return {
      data: item,
      x: r * Math.cos(angle),
      y: height,
      z: r * Math.sin(angle),
      size: 0.7 + Math.random() * 0.6
    };
  });
};

/**
 * Сетка (Grid)
 * Плоская 2D сетка с небольшой вариацией по Z
 */
export const generateGridPositions: CloudLayoutGenerator = (items, spacing = 100) => {
  const cols = Math.ceil(Math.sqrt(items.length));
  
  return items.map((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const offset = (cols - 1) * spacing / 2;
    
    return {
      data: item,
      x: col * spacing - offset,
      y: row * spacing - offset,
      z: (Math.random() - 0.5) * 100, // небольшая вариация по глубине
      size: 0.7 + Math.random() * 0.6
    };
  });
};

/**
 * Волна (Wave)
 * Синусоидальная волна в 3D пространстве
 */
export const generateWavePositions: CloudLayoutGenerator = (items, amplitude = 300) => {
  const cols = Math.ceil(Math.sqrt(items.length));
  const spacing = amplitude * 2 / cols;
  
  return items.map((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * spacing - amplitude;
    const z = row * spacing - amplitude;
    
    // Синусоидальная волна
    const y = Math.sin(x / 50) * 80 + Math.cos(z / 50) * 80;
    
    return {
      data: item,
      x, y, z,
      size: 0.7 + Math.random() * 0.6
    };
  });
};

/**
 * Объект с генераторами для быстрого доступа
 */
export const cloudLayoutGenerators: Record<string, CloudLayoutGenerator> = {
  sphere: generateSpherePositions,
  cube: generateCubePositions,
  spiral: generateSpiralPositions,
  grid: generateGridPositions,
  wave: generateWavePositions
};
