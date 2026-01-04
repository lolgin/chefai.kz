/**
 * cosmicModelConverter.ts
 * 
 * Конвертация моделей из разных форматов в единый для нашего проекта
 * Поддержка: GLTF → Three.js, Procedural → Three.js, Текстуры → Material
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { CosmicModel, ModelProvider, ProceduralConfig } from './cosmicModelProviders';

export interface UnifiedCosmicObject {
  mesh: THREE.Mesh;
  material: THREE.Material;
  light?: THREE.PointLight;
  rings?: THREE.Mesh;
  atmosphere?: THREE.Mesh;
}

/**
 * Главный конвертер космических моделей
 */
export class CosmicModelConverter {
  private gltfLoader = new GLTFLoader();
  private textureLoader = new THREE.TextureLoader();
  private cache = new Map<string, UnifiedCosmicObject>();

  /**
   * Конвертировать модель из любого провайдера в Three.js объект
   */
  async convert(model: CosmicModel): Promise<UnifiedCosmicObject> {
    // Проверяем кэш
    if (this.cache.has(model.id)) {
      return this.cache.get(model.id)!;
    }

    let result: UnifiedCosmicObject;

    switch (model.provider) {
      case ModelProvider.PROCEDURAL:
        result = await this.createProceduralObject(model);
        break;
      
      case ModelProvider.NASA:
      case ModelProvider.POLY_HAVEN:
        result = await this.createTexturedSphere(model);
        break;
      
      case ModelProvider.SKETCHFAB:
        result = await this.loadGLTFModel(model);
        break;
      
      default:
        result = await this.createProceduralObject(model);
    }

    this.cache.set(model.id, result);
    return result;
  }

  /**
   * Создать процедурно сгенерированный объект
   */
  private async createProceduralObject(model: CosmicModel): Promise<UnifiedCosmicObject> {
    const config = model.proceduralConfig!;
    const geometry = new THREE.SphereGeometry(1, 64, 64);

    // Создаем материал с процедурным шейдером
    const material = new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: new THREE.Color(config.baseColor) },
        noiseScale: { value: config.noiseScale },
        time: { value: 0 }
      },
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(config)
    });

    const mesh = new THREE.Mesh(geometry, material);

    const result: UnifiedCosmicObject = { mesh, material };

    // Добавляем кольца если есть
    if (config.rings) {
      result.rings = this.createRings(config.rings);
    }

    // Добавляем атмосферу если есть
    if (config.atmosphereColor) {
      result.atmosphere = this.createAtmosphere(config.atmosphereColor);
    }

    // Добавляем свет для звезд
    if (model.type === 'star') {
      result.light = new THREE.PointLight(
        new THREE.Color(config.baseColor),
        2,
        100
      );
    }

    return result;
  }

  /**
   * Создать сферу с текстурой (NASA, Poly Haven)
   */
  private async createTexturedSphere(model: CosmicModel): Promise<UnifiedCosmicObject> {
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Загружаем текстуру
    const texture = await new Promise<THREE.Texture>((resolve, reject) => {
      this.textureLoader.load(
        model.textureUrl!,
        resolve,
        undefined,
        reject
      );
    });

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.2
    });

    const mesh = new THREE.Mesh(geometry, material);

    const result: UnifiedCosmicObject = { mesh, material };

    // Добавляем атмосферу для планет
    if (model.metadata?.atmosphere) {
      result.atmosphere = this.createAtmosphere(model.metadata.color || '#0066cc');
    }

    return result;
  }

  /**
   * Загрузить GLTF модель (Sketchfab)
   */
  private async loadGLTFModel(model: CosmicModel): Promise<UnifiedCosmicObject> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        model.modelUrl!,
        (gltf) => {
          const mesh = gltf.scene.children[0] as THREE.Mesh;
          resolve({
            mesh,
            material: mesh.material as THREE.Material
          });
        },
        undefined,
        reject
      );
    });
  }

  /**
   * Создать кольца планеты
   */
  private createRings(config: { innerRadius: number; outerRadius: number; color: string }): THREE.Mesh {
    const geometry = new THREE.RingGeometry(config.innerRadius, config.outerRadius, 64);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.color),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const rings = new THREE.Mesh(geometry, material);
    rings.rotation.x = Math.PI / 2;
    return rings;
  }

  /**
   * Создать атмосферу планеты
   */
  private createAtmosphere(color: string): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(1.1, 32, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(color) }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(color, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Mesh(geometry, material);
  }

  /**
   * Vertex shader для процедурной генерации
   */
  private getVertexShader(): string {
    return `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  /**
   * Fragment shader для процедурной генерации
   */
  private getFragmentShader(config: ProceduralConfig): string {
    return `
      uniform vec3 baseColor;
      uniform float noiseScale;
      uniform float time;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
      
      void main() {
        // Процедурный шум для текстуры
        float noise = snoise(vPosition * noiseScale + time * 0.1);
        noise = (noise + 1.0) * 0.5; // Нормализуем в 0-1
        
        // Базовый цвет с вариацией
        vec3 color = mix(baseColor * 0.7, baseColor * 1.3, noise);
        
        // Освещение
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diff = max(dot(vNormal, lightDir), 0.0);
        color *= (0.3 + diff * 0.7);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;
  }

  /**
   * Очистить кэш
   */
  clearCache() {
    this.cache.forEach(obj => {
      obj.mesh.geometry.dispose();
      if (obj.material instanceof THREE.Material) {
        obj.material.dispose();
      }
      if (obj.rings) {
        obj.rings.geometry.dispose();
        (obj.rings.material as THREE.Material).dispose();
      }
      if (obj.atmosphere) {
        obj.atmosphere.geometry.dispose();
        (obj.atmosphere.material as THREE.Material).dispose();
      }
    });
    this.cache.clear();
  }
}

// Singleton
export const cosmicModelConverter = new CosmicModelConverter();
