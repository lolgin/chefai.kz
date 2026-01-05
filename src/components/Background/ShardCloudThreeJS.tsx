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

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ShardCloudThreeJSProps {
  rotation: { x: number; y: number };
  shards: Array<{
    data: any;
    x: number;
    y: number;
    z: number;
    size: number;
    model3DUrl?: string; // URL to .glb/.gltf model
  }>;
  onShardClick: (item: any) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  theme: { accent: string };
  use3DModels?: boolean; // Enable 3D model loading
}

export const ShardCloudThreeJS: React.FC<ShardCloudThreeJSProps> = ({
  rotation,
  shards,
  onShardClick,
  theme,
  use3DModels = false
}) => {
  // Визуализация провайдеров больше не используется
  // Все позиции приходят через shards prop (кешированные в App.tsx)
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectsRef = useRef<Map<THREE.Mesh | THREE.Group, any>>(new Map());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const isDraggingRef = useRef(false);
  const mouseDownPosRef = useRef({ x: 0, y: 0 });
  const isRightDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const gltfLoaderRef = useRef<GLTFLoader>(new GLTFLoader());
  const currentRotationRef = useRef({ x: 0, y: 0 });
  
  // Для перетаскивания планет
  const draggedMeshRef = useRef<THREE.Mesh | null>(null);
  const dragStartPosRef = useRef<THREE.Vector3 | null>(null);
  const dragPlaneRef = useRef<THREE.Plane | null>(null);

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
    camera.position.z = 1200; // Увеличили с 800 до 1200 - камера дальше
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
    objectsRef.current.forEach((data, obj) => {
      scene.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });
    objectsRef.current.clear();

    // Создаём новые объекты
    shards.forEach((shard, index) => {
      const x = shard.x;
      const y = shard.y;
      const z = shard.z;
      const scale = 1.0;
      
      // Проверяем, нужно ли загружать 3D модель
      if (use3DModels && shard.model3DUrl) {
        load3DModel(shard, x, y, z, scale, scene, index);
      } else {
        // Fallback: обычная сфера
        createSphere(shard, x, y, z, scale, scene, index);
      }
    });
  }, [shards, use3DModels]);

  // Функция создания сферы (fallback)
  const createSphere = (
    shard: any,
    x: number,
    y: number,
    z: number,
    scale: number,
    scene: THREE.Scene,
    index: number
  ) => {
    const radius = shard.size * 15 * scale;
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    
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
    objectsRef.current.set(mesh, shard.data);
    scene.add(mesh);
  };

  // Функция загрузки 3D модели
  const load3DModel = (
    shard: any,
    x: number,
    y: number,
    z: number,
    scale: number,
    scene: THREE.Scene,
    index: number
  ) => {
    const loader = gltfLoaderRef.current;
    
    // Обработка primitive:// URL
    if (shard.model3DUrl.startsWith('primitive://')) {
      const shape = shard.model3DUrl.replace('primitive://', '');
      createPrimitive(shape, shard, x, y, z, scale, scene, index);
      return;
    }

    // Загрузка GLTF модели
    loader.load(
      shard.model3DUrl,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(x, y, z);
        
        const desiredSize = shard.size * 30;
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        model.scale.setScalar(desiredSize / maxDim);

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.emissive = new THREE.Color(0x333333);
            child.material.emissiveIntensity = 0.1;
          }
        });

        objectsRef.current.set(model, shard.data);
        scene.add(model);
      },
      undefined,
      () => createSphere(shard, x, y, z, scale, scene, index)
    );
  };

  // Примитивы
  const createPrimitive = (
    shape: string,
    shard: any,
    x: number,
    y: number,
    z: number,
    scale: number,
    scene: THREE.Scene,
    index: number
  ) => {
    let geometry: THREE.BufferGeometry;
    const size = shard.size * 15 * scale;

    switch (shape) {
      case 'box': geometry = new THREE.BoxGeometry(size, size, size); break;
      case 'cone': geometry = new THREE.ConeGeometry(size, size * 2, 16); break;
      case 'cylinder': geometry = new THREE.CylinderGeometry(size, size, size * 2, 16); break;
      case 'torus': geometry = new THREE.TorusGeometry(size, size * 0.4, 16, 32); break;
      default: geometry = new THREE.SphereGeometry(size, 32, 32);
    }

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
    objectsRef.current.set(mesh, shard.data);
    scene.add(mesh);
  };

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

    // Левая кнопка - клики на объекты или перетаскивание планет
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Левая кнопка
        isDraggingRef.current = false;
        mouseDownPosRef.current = { x: event.clientX, y: event.clientY };
        
        // Проверяем попадание в планету
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(Array.from(objectsRef.current.keys()));
        
        if (intersects.length > 0) {
          // Начинаем drag планеты
          const mesh = intersects[0].object as THREE.Mesh;
          draggedMeshRef.current = mesh;
          dragStartPosRef.current = mesh.position.clone();
          
          // Создаем плоскость для drag'a (параллельную камере)
          const normal = new THREE.Vector3(0, 0, 1);
          normal.applyQuaternion(camera.quaternion);
          dragPlaneRef.current = new THREE.Plane(normal, 0);
          dragPlaneRef.current.setFromNormalAndCoplanarPoint(normal, mesh.position);
        }
      } else if (event.button === 2) { // Правая кнопка - вращение облака
        event.preventDefault();
        isRightDraggingRef.current = true;
        lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      // Перетаскивание планеты левой кнопкой
      if (event.buttons === 1 && draggedMeshRef.current && dragPlaneRef.current) {
        const dx = Math.abs(event.clientX - mouseDownPosRef.current.x);
        const dy = Math.abs(event.clientY - mouseDownPosRef.current.y);
        
        if (dx > 5 || dy > 5) {
          isDraggingRef.current = true;
          
          // Raycast на плоскость drag'a
          const rect = canvas.getBoundingClientRect();
          mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          
          raycasterRef.current.setFromCamera(mouseRef.current, camera);
          
          const intersection = new THREE.Vector3();
          raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersection);
          
          if (intersection) {
            // Обновляем позицию планеты
            draggedMeshRef.current.position.copy(intersection);
          }
        }
      }

      // Вращение облака правой кнопкой
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
      if (event.button === 0) {
        // Сбрасываем drag планеты
        draggedMeshRef.current = null;
        dragStartPosRef.current = null;
        dragPlaneRef.current = null;
      } else if (event.button === 2) {
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
