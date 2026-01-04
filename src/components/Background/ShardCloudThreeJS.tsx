/**
 * ShardCloudThreeJS.tsx
 * 
 * 3D облако на базе Three.js с поддержкой провайдеров визуализации
 * Содержит:
 * - Интеграция с системой провайдеров
 * - Сферы разных размеров и цветов
 * - Клики на объекты через raycasting
 * - Вращение мышью
 */

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useVisualizationProvider } from '../../hooks/useVisualizationProvider';
import { VisualizationProvider } from '../../services/visualizationProviders';
import { useSettings } from '../../contexts/SettingsContext';

interface ShardCloudThreeJSProps {
  rotation: { x: number; y: number };
  shards: Array<{
    data: any;
    x: number;
    y: number;
    z: number;
    size: number;
  }>;
  onShardClick: (item: any) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  theme: { accent: string };
}

export const ShardCloudThreeJS: React.FC<ShardCloudThreeJSProps> = ({
  rotation,
  shards,
  onShardClick,
  theme
}) => {
  const { settings } = useSettings();
  
  // Проверяем включен ли провайдер визуализации
  const visualizationEnabled = settings.display?.visualizationEnabled !== false;
  const currentProvider = (settings.display?.visualizationProvider as VisualizationProvider) || VisualizationProvider.THREEJS_PLANETS;
  
  // Мемоизируем items чтобы избежать пересоздания при каждом рендере
  const items = useMemo(() => {
    return shards.map(s => ({
      id: typeof s.data === 'object' && s.data?.name ? s.data.name : String(s.data),
      name: typeof s.data === 'object' && s.data?.name ? s.data.name : String(s.data),
      ...s.data
    }));
  }, [shards]);
  
  // Используем провайдер только если визуализация включена
  const { layout: providedLayout } = useVisualizationProvider({
    providerId: currentProvider,
    items: visualizationEnabled ? items : [], // Пустой массив когда выключено
    config: {}
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectsRef = useRef<Map<THREE.Mesh, any>>(new Map());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const isDraggingRef = useRef(false);
  const mouseDownPosRef = useRef({ x: 0, y: 0 });
  const isRightDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });

  // Инициализация Three.js
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      5000
    );
    camera.position.z = 800;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Point light
    const pointLight = new THREE.PointLight(0xffffff, 1, 2000);
    pointLight.position.set(500, 500, 500);
    scene.add(pointLight);

    // Handle resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Обновление объектов
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Очищаем старые объекты
    objectsRef.current.forEach((data, mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    objectsRef.current.clear();

    // Создаём новые объекты
    shards.forEach((shard, index) => {
      const itemId = typeof shard.data === 'object' && shard.data?.name ? shard.data.name : String(shard.data);
      
      // КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: используем позиции из провайдера ТОЛЬКО если визуализация включена
      let x, y, z, scale;
      if (visualizationEnabled) {
        const position = providedLayout.get(itemId);
        x = position?.x ?? shard.x;
        y = position?.y ?? shard.y;
        z = position?.z ?? shard.z;
        scale = position?.scale ?? 1.0;
      } else {
        // Когда провайдер выключен - используем ТОЛЬКО дефолтные позиции из shards (стабильные из кеша)
        x = shard.x;
        y = shard.y;
        z = shard.z;
        scale = 1.0;
      }
      
      const radius = shard.size * 15 * scale; // Размер планеты с учетом scale
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      
      // Цвет от позиции
      const hue = (index * 137.5) % 360;
      const color = new THREE.Color(`hsl(${hue}, 70%, 60%)`);
      
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.7,
        metalness: 0.3,
        emissive: color,
        emissiveIntensity: 0.2
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      
      // Применяем rotation из провайдера если есть И визуализация включена
      if (visualizationEnabled) {
        const position = providedLayout.get(itemId);
        if (position?.rotation) {
          mesh.rotation.set(position.rotation.x, position.rotation.y, position.rotation.z);
        }
      }
      
      // Сохраняем данные
      objectsRef.current.set(mesh, shard.data);
      scene.add(mesh);
    });
  }, [
    shards, 
    visualizationEnabled,
    // КРИТИЧЕСКИ ВАЖНО: providedLayout НЕ должен быть в dependencies когда visualization выключена!
    // Это предотвращает перерендер при каждом изменении items
    ...(visualizationEnabled ? [providedLayout] : [])
  ]);

  // Применяем вращение
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    
    // Используем внутреннее вращение (от правой кнопки мыши)
    scene.rotation.x = THREE.MathUtils.degToRad(currentRotationRef.current.x);
    scene.rotation.y = THREE.MathUtils.degToRad(currentRotationRef.current.y);
  }, []);

  // Обработчики взаимодействия
  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!canvas || !scene || !camera) return;

    // Левая кнопка - клики на объекты
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Левая кнопка
        isDraggingRef.current = false;
        mouseDownPosRef.current = { x: event.clientX, y: event.clientY };
      } else if (event.button === 2) { // Правая кнопка
        event.preventDefault();
        isRightDraggingRef.current = true;
        lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      // Для левой кнопки - проверка на драг
      if (event.buttons === 1) {
        const dx = Math.abs(event.clientX - mouseDownPosRef.current.x);
        const dy = Math.abs(event.clientY - mouseDownPosRef.current.y);
        if (dx > 5 || dy > 5) {
          isDraggingRef.current = true;
        }
      }

      // Для правой кнопки - вращение
      if (isRightDraggingRef.current && event.buttons === 2) {
        const deltaX = event.clientX - lastMousePosRef.current.x;
        const deltaY = event.clientY - lastMousePosRef.current.y;

        currentRotationRef.current.y += deltaX * 0.3;
        currentRotationRef.current.x += deltaY * 0.3;

        scene.rotation.x = THREE.MathUtils.degToRad(currentRotationRef.current.x);
        scene.rotation.y = THREE.MathUtils.degToRad(currentRotationRef.current.y);

        lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 2) {
        isRightDraggingRef.current = false;
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (isDraggingRef.current || event.button !== 0) return;

      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(Array.from(objectsRef.current.keys()));

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const data = objectsRef.current.get(mesh);
        if (data) {
          onShardClick(data);
        }
      }
    };

    // Колесико мыши - zoom
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY * -0.5;
      camera.position.z = Math.max(300, Math.min(1500, camera.position.z + delta));
    };

    // Отключаем контекстное меню на правый клик
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [onShardClick]);

  return (
    <div className="scene-3d flex-1 pointer-events-auto">
      <canvas 
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
};
