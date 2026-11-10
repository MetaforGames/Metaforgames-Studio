import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { artworks as defaultArtworksList, Artwork } from '../data/artworks';
import { Html } from '@react-three/drei';
import { Plus } from 'lucide-react';

function AnimatedStarsBackground({ visible }: { visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Minimal uniform tracking since no textures are needed
  const uniforms = useRef({
    uTime: { value: 0 },
    uOpacity: { value: 0 },
    uMouse: { value: new THREE.Vector2() }
  });

  useFrame((state, delta) => {
    if (meshRef.current) {
      uniforms.current.uTime.value += delta;
      uniforms.current.uMouse.value.lerp(state.pointer, 5 * delta);
      const targetOpacity = visible ? 1.0 : 0.0;
      uniforms.current.uOpacity.value = THREE.MathUtils.lerp(uniforms.current.uOpacity.value, targetOpacity, 3 * delta);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -20]}>
      <planeGeometry args={[200, 200]} />
      <shaderMaterial
        side={THREE.DoubleSide}
        transparent
        depthWrite={false}
        uniforms={uniforms.current}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform float uTime;
          uniform float uOpacity;
          uniform vec2 uMouse;

          float random(vec2 st) {
              return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
          }

          void main() {
             vec3 color = vec3(0.01, 0.01, 0.02);
             
             vec2 baseUv = vUv * 800.0;
             
             vec2 st1 = floor(baseUv + uMouse * 5.0) / 800.0;
             float r1 = random(st1);
             if (r1 > 0.995) {
               float twinkle = sin(uTime * 3.0 * random(st1 * 1.5)) * 0.5 + 0.5;
               float size = random(st1 * 3.0);
               color += vec3(1.0) * twinkle * size;
             }
             
             vec2 st2 = floor(baseUv + uMouse * 15.0) / 800.0;
             float r2 = random(st2);
             if (r2 > 0.992 && r2 <= 0.995) {
               float twinkle = sin(uTime * 2.0 * random(st2 * 1.5)) * 0.5 + 0.5;
               float size = random(st2 * 2.0);
               color += vec3(0.8, 0.9, 1.0) * twinkle * size * 0.8;
             }
             
             vec2 st3 = floor(baseUv + uMouse * 35.0) / 800.0;
             float r3 = random(st3 + 12.34);
             if (r3 > 0.990) {
               float twinkle = sin(uTime * 1.0 * random(st3 * 1.5)) * 0.5 + 0.5;
               float size = random(st3 * 4.0);
               color += vec3(0.6, 0.7, 0.9) * twinkle * size * 0.6;
             }
             
             vec2 st4 = floor(baseUv + uMouse * 80.0) / 800.0;
             float r4 = random(st4 + 45.67);
             if (r4 > 0.992) {
               float twinkle = sin(uTime * 4.0 * random(st4 * 1.5)) * 0.5 + 0.5;
               float size = random(st4 * 5.0);
               color += vec3(0.9, 0.8, 1.0) * twinkle * size * 0.4;
             }
             
             gl_FragColor = vec4(color, uOpacity);
          }
        `}
      />
    </mesh>
  );
}

interface PortfolioCarouselProps {
  active: boolean;
  onSelect: (id: string) => void;
  artworks?: Artwork[];
  onOpenContribute?: () => void;
}

export function PortfolioCarousel({ 
  active, 
  onSelect,
  artworks: artworksList = defaultArtworksList,
  onOpenContribute
}: PortfolioCarouselProps) {
  const { camera } = useThree();
  const [targetIdx, setTargetIdx] = useState(0);
  const currentIdx = useRef(0);
  const blastOffActive = useRef(false);
  const isVisible = useRef(false);
  const [glintVisible, setGlintVisible] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragCurrent, setDragCurrent] = useState<number | null>(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    const handleNext = () => setTargetIdx(t => t - 1);
    const handlePrev = () => setTargetIdx(t => t + 1);
    window.addEventListener('carousel-next', handleNext);
    window.addEventListener('carousel-prev', handlePrev);
    return () => {
      window.removeEventListener('carousel-next', handleNext);
      window.removeEventListener('carousel-prev', handlePrev);
    };
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  const outerGroupsRef = useRef<THREE.Group[]>([]);
  const innerMeshesRef = useRef<THREE.Mesh[]>([]);
  const htmlDivsRef = useRef<(HTMLDivElement | null)[]>([]);
  const glintRef = useRef<THREE.Mesh>(null);
  
  const currentSway = useRef(new THREE.Vector3());
  const targetSway = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!groupRef.current) return;

    if (!active && !isVisible.current) {
      outerGroupsRef.current.forEach(g => {
        if (g) g.scale.set(0, 0, 0);
      });
    }

    if (active) {
      isVisible.current = true;
      blastOffActive.current = false;
      setTargetIdx(0);
      currentIdx.current = 0;

      const distance = 8;
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const basePos = camera.position.clone().add(dir.multiplyScalar(distance));
      groupRef.current.position.copy(basePos);
      groupRef.current.quaternion.copy(camera.quaternion);
      groupRef.current.updateMatrixWorld();

      const entranceDelay = 1.2;

      outerGroupsRef.current.forEach((group, i) => {
        if (!group) return;
        
        group.position.set(0, -10, 5);
        group.rotation.set(Math.PI / 4, 0, 0); 
        group.scale.set(0.01, 0.01, 0.01);

        const delay = entranceDelay + i * 0.05;

        gsap.to(group.position, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.0,
          delay: delay,
          ease: "power3.out"
        });
        
        gsap.fromTo(group.rotation, 
          { x: Math.PI / 4, y: Math.PI / 2, z: -Math.PI / 6 },
          {
            x: 0, y: 0, z: 0,
            duration: 1.0,
            delay: delay,
            ease: "back.out(1.2)"
          }
        );

        gsap.to(group.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.8,
          delay: delay,
          ease: "back.out(1.5)"
        });
      });

    } else if (isVisible.current) {
      blastOffActive.current = true;
      
      outerGroupsRef.current.forEach((group, i) => {
        if (!group) return;
        
        const targetX = (Math.random() - 0.5) * 100;
        const targetY = (Math.random() - 0.5) * 100;
        const targetZ = -500;

        gsap.to(group.position, {
          x: targetX,
          y: targetY,
          z: targetZ,
          duration: 1.2,
          ease: "power3.in"
        });

        gsap.to(group.rotation, {
          x: (Math.random() - 0.5) * Math.PI * 15,
          y: (Math.random() - 0.5) * Math.PI * 15,
          z: (Math.random() - 0.5) * Math.PI * 15,
          duration: 1.2,
          ease: "power2.in"
        });

        gsap.to(group.scale, {
          x: 0, y: 0, z: 0,
          duration: 1.2,
          ease: "power3.in",
          onComplete: () => {
             if (htmlDivsRef.current[i]) {
               htmlDivsRef.current[i]!.style.opacity = '0';
             }
            if (i === artworksList.length - 1) {
              setGlintVisible(true);
              
              if (glintRef.current) {
                glintRef.current.scale.set(0.1, 0.1, 0.1);
                gsap.to(glintRef.current.scale, {
                  x: 3, y: 3, z: 3,
                  duration: 0.15,
                  yoyo: true,
                  repeat: 1,
                  ease: "power1.inOut",
                  onComplete: () => {
                    setGlintVisible(false);
                    isVisible.current = false;
                  }
                });
              } else {
                isVisible.current = false;
              }
            }
          }
        });
      });
    }
  }, [active, camera, artworksList.length]);

  useFrame((state, delta) => {
    if (!isVisible.current) return;

    if (groupRef.current && active && !blastOffActive.current) {
      const distance = 8;
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const targetPos = camera.position.clone().add(dir.multiplyScalar(distance));
      groupRef.current.position.copy(targetPos);
      
      let dragSwayY = 0;
      let dragSwayZ = 0;
      if (dragStart !== null && dragCurrent !== null) {
         const deltaX = dragCurrent - dragStart;
         dragSwayY = THREE.MathUtils.clamp(deltaX * 0.001, -0.6, 0.6);
         dragSwayZ = THREE.MathUtils.clamp(deltaX * 0.0005, -0.3, 0.3);
      }
      
      targetSway.current.y = dragSwayY;
      targetSway.current.x = 0;
      targetSway.current.z = dragSwayZ;

      currentSway.current.x = THREE.MathUtils.lerp(currentSway.current.x, targetSway.current.x, 8 * delta);
      currentSway.current.y = THREE.MathUtils.lerp(currentSway.current.y, targetSway.current.y, 8 * delta);
      currentSway.current.z = THREE.MathUtils.lerp(currentSway.current.z, targetSway.current.z, 8 * delta);

      const euler = new THREE.Euler().setFromQuaternion(camera.quaternion);
      euler.x += currentSway.current.x;
      euler.y += currentSway.current.y;
      euler.z -= currentSway.current.z;

      groupRef.current.quaternion.setFromEuler(euler);
    }

    let dragOffset = 0;
    if (dragStart !== null && dragCurrent !== null) {
      dragOffset = THREE.MathUtils.clamp((dragStart - dragCurrent) * 0.005, -1.0, 1.0); 
    }
    const targetWithDrag = targetIdx + dragOffset;
    
    currentIdx.current = THREE.MathUtils.lerp(currentIdx.current, targetWithDrag, 4 * delta);

    if (!blastOffActive.current) {
      const mouseX = state.pointer.x;
      const mouseY = state.pointer.y;

      innerMeshesRef.current.forEach((mesh, i) => {
        if (mesh) {
          const len = artworksList.length;
          let offset = ((i - currentIdx.current) % len + len) % len;
          if (offset > len / 2) offset -= len;
          
          let targetX = offset * 3.8;
          let targetY = -Math.pow(Math.abs(offset), 1.5) * 0.4;
          let targetZ = -Math.abs(offset) * 1.5;
          let targetRotZ = -offset * 0.12;
          let targetRotY = -offset * 0.15;

          const centerDist = Math.abs(offset);

          if (centerDist < 0.5) {
            const parallaxFactor = Math.pow(1.0 - (centerDist * 2.0), 2.0);
            targetX += mouseX * parallaxFactor * 0.5;
            targetY += mouseY * parallaxFactor * 0.5;
            targetRotY += mouseX * parallaxFactor * 0.2;
            targetRotZ -= mouseX * parallaxFactor * 0.05;
          }

          if (centerDist < 1.0 && dragOffset !== 0) {
            const dragMultiplier = (1.0 - centerDist) * 2.0; 
            targetX += dragOffset * dragMultiplier;
          }

          mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, targetX, 10 * delta);
          mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetY, 10 * delta);
          mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, targetZ, 10 * delta);
          mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRotY, 10 * delta);
          mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, targetRotZ, 10 * delta);

          let fade = 1.0 - Math.pow(Math.abs(offset) / (len * 0.4), 2.0);
          fade = Math.max(0, fade);
          if (htmlDivsRef.current[i]) {
             htmlDivsRef.current[i]!.style.opacity = fade.toString();
             if (centerDist < 0.2) {
                htmlDivsRef.current[i]!.style.transform = 'scale(1.05) translateZ(10px)';
             } else {
                htmlDivsRef.current[i]!.style.transform = 'scale(1)';
             }
          }
        }
      });
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (!active || blastOffActive.current) return;
    isDragging.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setDragStart(e.clientX);
    setDragCurrent(e.clientX);
  };

  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    if (dragStartPos.current) {
      const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
      if (dist > 10) {
        isDragging.current = true;
      }
    }
    if (dragStart !== null) {
      setDragCurrent(e.clientX);
    }
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    if (dragStart !== null) {
      const delta = e.clientX - dragStart;
      if (delta > 50) {
        setTargetIdx(targetIdx - 1);
      } else if (delta < -50) {
        setTargetIdx(targetIdx + 1);
      }
      setDragStart(null);
      setDragCurrent(null);
    }
    dragStartPos.current = null;
  };

  return (
    <group ref={groupRef}>
      <AnimatedStarsBackground visible={active && !blastOffActive.current} />
      
      {active && (
        <mesh 
          position={[0, 0, -2]} 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerOut={() => {
            setDragStart(null);
            setDragCurrent(null);
          }}
        >
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
      )}

      {artworksList.map((art, i) => (
        <group 
          key={art.id} 
          ref={(el) => { if (el) outerGroupsRef.current[i] = el; }}
          scale={[0, 0, 0]}
        >
          <mesh 
            ref={(el) => { if (el) innerMeshesRef.current[i] = el; }}
            onClick={(e) => {
              e.stopPropagation();
              if (!active || blastOffActive.current) return;
              if (isDragging.current) {
                isDragging.current = false;
                return;
              }
              
              const len = artworksList.length;
              let diff = ((i - Math.round(currentIdx.current)) % len + len) % len;
              if (diff > len / 2) diff -= len;

              if (Math.abs(diff) < 0.1) {
                if (art.isContributionPrompt && onOpenContribute) {
                  onOpenContribute();
                } else {
                  onSelect(art.id);
                }
              } else {
                setTargetIdx(targetIdx + diff);
              }
            }}
            onPointerOver={() => {
               if (!active || blastOffActive.current) return;
               document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
               document.body.style.cursor = 'auto';
            }}
          >
            <planeGeometry args={[2.0825, 3.1535]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} color="#000000" />
            
            <Html transform center pointerEvents="none" distanceFactor={4.5}>
              <div 
                ref={(el) => { htmlDivsRef.current[i] = el; }}
                className={`w-[280px] h-[400px] flex flex-col rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)] border transition-transform duration-300 pointer-events-none ${
                  art.isContributionPrompt 
                    ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500/40'
                    : 'bg-slate-50 border-slate-200/20'
                }`}
              >
                  {/* Top Image Area */}
                  <div className="h-[55%] w-full relative shrink-0">
                    <img src={art.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/90 via-black/40 to-transparent"></div>
                    
                    {art.purpose && (
                      <div className="absolute top-2.5 right-3 bg-emerald-500/90 text-slate-950 text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold">
                        {art.purpose}
                      </div>
                    )}

                    <h3 className="absolute top-4 left-4 right-4 text-center font-display font-bold text-[21px] tracking-tight text-white leading-tight drop-shadow-md py-1">
                      {art.title}
                    </h3>
                  </div>
                  {/* Bottom List Area */}
                  <div className={`flex-1 w-full px-5 py-4 flex flex-col justify-between ${
                    art.isContributionPrompt ? 'bg-slate-900/90 text-gray-200' : 'bg-white text-slate-600 shadow-inner'
                  }`}>
                     <ul className={`text-[13px] font-medium space-y-2.5 ${
                       art.isContributionPrompt ? 'text-gray-300' : 'text-slate-600'
                     }`}>
                       {art.features.map((f, idx) => (
                         <li key={idx} className="flex items-start gap-2.5">
                           <span className={`font-black mt-0.5 text-[8px] drop-shadow-sm ${
                             art.isContributionPrompt ? 'text-emerald-400' : 'text-slate-800'
                           }`}>●</span>
                           <span className="leading-tight drop-shadow-sm">{f}</span>
                         </li>
                       ))}
                     </ul>

                     {art.isContributionPrompt && (
                       <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-emerald-400 font-mono text-[11px] font-bold">
                         <span className="uppercase tracking-wider">Click to Add Project</span>
                         <Plus size={14} className="animate-pulse" />
                       </div>
                     )}
                  </div>
              </div>
            </Html>
          </mesh>
        </group>
      ))}

      <mesh ref={glintRef} visible={glintVisible} position={[0, 0, -500]}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} map={createGlintTexture()} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function createGlintTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(60, 10, 8, 108);
  ctx.fillRect(10, 60, 108, 8);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
