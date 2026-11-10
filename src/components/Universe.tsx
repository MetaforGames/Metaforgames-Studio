import { useThree, useFrame } from '@react-three/fiber';
import { Stars, Html, Text, Float, OrbitControls, Billboard, Trail, useTexture } from '@react-three/drei';
import { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import gsap from 'gsap';
import { artworks as defaultArtworksList, Artwork } from '../data/artworks';
import { CosmicDust } from './CosmicDust';

interface UniverseProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  portfolioActive?: boolean;
  cinematicMode?: boolean;
  introStage?: string;
  progress?: number;
  artworks?: Artwork[];
}

function ParallaxStars() {
  const group1 = useRef<THREE.Group>(null);
  const group2 = useRef<THREE.Group>(null);
  const group3 = useRef<THREE.Group>(null);
  const scrollY = useRef(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      scrollY.current += e.deltaY * 0.002;
    };
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  useFrame(() => {
    if (group1.current) group1.current.rotation.x = THREE.MathUtils.lerp(group1.current.rotation.x, scrollY.current * 0.5, 0.05);
    if (group2.current) group2.current.rotation.x = THREE.MathUtils.lerp(group2.current.rotation.x, scrollY.current * 0.3, 0.05);
    if (group3.current) group3.current.rotation.x = THREE.MathUtils.lerp(group3.current.rotation.x, scrollY.current * 0.1, 0.05);
  });

  return (
    <>
      <group ref={group3}><Stars radius={150} depth={20} count={2000} factor={3} saturation={0} fade speed={0.5} /></group>
      <group ref={group2}><Stars radius={100} depth={30} count={1500} factor={4} saturation={0} fade speed={1} /></group>
      <group ref={group1}><Stars radius={60} depth={40} count={1000} factor={5} saturation={0} fade speed={2} /></group>
    </>
  );
}

function CameraController({ 
  selectedId, 
  controlsRef, 
  portfolioActive, 
  cinematicMode, 
  introStage, 
  progress, 
  worldGroupRef,
  artworks: artworksList = defaultArtworksList 
}: { 
  selectedId: string | null; 
  controlsRef: React.RefObject<OrbitControlsImpl | null>; 
  portfolioActive?: boolean; 
  cinematicMode?: boolean; 
  introStage?: string; 
  progress?: number; 
  worldGroupRef?: React.RefObject<THREE.Group | null>;
  artworks?: Artwork[];
}) {
  const { camera } = useThree();
  const currentZ = useRef(500); // 20x further away than 25 is 500
  const prevProgress = useRef(0);
  const currentSpeed = useRef(0);
  const speedLinesMatRef = useRef<THREE.ShaderMaterial>(null);
  const speedLinesQuadRef = useRef<THREE.Mesh>(null);
  const prevSelectedId = useRef<string | null>(null);

  useEffect(() => {
    if (introStage === 'loading') {
       currentZ.current = 500;
       camera.position.set(0, 0, 500);
       if (controlsRef.current) gsap.set(controlsRef.current.target, { x: 0, y: 0, z: 0 });
    }
  }, [introStage, camera, controlsRef]);

  useEffect(() => {
    if (introStage === 'loading' && progress !== undefined) {
      const diff = progress - prevProgress.current;
      if (diff > 0) {
        // Boost speed greatly when progress jumps
        currentSpeed.current = Math.min(2.0, currentSpeed.current + diff * 0.2);
      }
      prevProgress.current = progress;
    }
  }, [progress, introStage]);

  useFrame((_, delta) => {
    if (introStage === 'loading' && progress !== undefined) {
       // Target z distance (500 -> 25)
       const targetZ = 500 - (progress / 100) * (500 - 25);
       
       // Smoother lerp so that during a lag pause, it naturally slows down towards the target 
       currentZ.current = THREE.MathUtils.lerp(currentZ.current, targetZ, delta * 4);
       
       // Calculate velocity-based speed lines to ensure they always show when moving
       const distMoved = Math.abs(camera.position.z - currentZ.current);
       if (distMoved > 2) {
           currentSpeed.current = Math.min(2.0, currentSpeed.current + delta * 5);
       }
       
       camera.position.z = currentZ.current;
       camera.position.x = 0;
       camera.position.y = 0;
       
       // Slower decay so speed lines stay visible
       currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, 0.0, delta * 3.5);
    }

    if (speedLinesQuadRef.current) {
        const dist = 3.5;
        camera.getWorldDirection(speedLinesQuadRef.current.position);
        speedLinesQuadRef.current.position.multiplyScalar(dist).add(camera.position);
        speedLinesQuadRef.current.quaternion.copy(camera.quaternion);
    }

    if (speedLinesMatRef.current) {
        // High visibility
        speedLinesMatRef.current.uniforms.uSpeed.value = currentSpeed.current;
        speedLinesMatRef.current.uniforms.uTime.value += delta;
        speedLinesMatRef.current.uniforms.uOpacity.value = (introStage === 'loading' && currentSpeed.current > 0.05) ? 1.0 : 0.0;
    }
  });

  useEffect(() => {
    if (introStage === 'loading') return;

    if (introStage === 'flash') {
       gsap.to(camera.position, {
         x: 0,
         y: 0,
         z: 60,
         duration: 3,
         ease: "power2.inOut",
         onUpdate: () => controlsRef.current?.update()
       });
       if (controlsRef.current) {
         gsap.to(controlsRef.current.target, {
           x: 0, y: 0, z: 0,
           duration: 3,
           ease: "power2.inOut"
         });
       }
       return;
    }

    if (portfolioActive) {
      gsap.killTweensOf(camera.position);
      if (controlsRef.current) gsap.killTweensOf(controlsRef.current.target);

      const startCam = camera.position.clone();
      
      // Calculate a zoom out position 
      const targetCam = startCam.clone();
      const currentDist = targetCam.length();
      targetCam.normalize().multiplyScalar(currentDist + 150); // Zoom out

      const proxy = { t: 0 };
      gsap.to(proxy, {
        t: 1,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
           const nextPos = startCam.clone().lerp(targetCam, proxy.t);
           
           // Shake effect on the camera trajectory
           // Peak shake at t=0.5
           const shakeIntensity = Math.sin(proxy.t * Math.PI) * 2.5; 
           nextPos.x += (Math.random() - 0.5) * shakeIntensity;
           nextPos.y += (Math.random() - 0.5) * shakeIntensity;
           
           camera.position.copy(nextPos);
        }
      });
    } else if (selectedId) {
      const isJump = prevSelectedId.current !== null && prevSelectedId.current !== selectedId;
      const art = artworksList.find(a => a.id === selectedId);
      
      if (art) {
        const rawTargetPos = new THREE.Vector3(...art.position);
        let targetPos = rawTargetPos.clone();
        if (worldGroupRef && worldGroupRef.current) {
           targetPos.applyMatrix4(worldGroupRef.current.matrixWorld);
        }
        
        // Direction from origin to target
        const dir = targetPos.clone().normalize();
        
        // The viewing direction from camera to artwork is -dir
        const viewDir = dir.clone().negate();
        
        // Calculate the camera's right vector (to offset the framing)
        let upVector = new THREE.Vector3(0, 1, 0);
        if (Math.abs(viewDir.y) > 0.99) upVector = new THREE.Vector3(1, 0, 0);
        
        const camRight = new THREE.Vector3().crossVectors(viewDir, upVector).normalize();
        
        // We shift the camera and its look target to the RIGHT, meaning the artwork effectively goes LEFT on screen
        const offset = camRight.multiplyScalar(2.0); // Shift by 2 units to the right
        
        // Position camera a bit back from the artwork and shift it
        const camPos = targetPos.clone().add(dir.multiplyScalar(6)).add(offset);
        const lookTarget = targetPos.clone().add(offset);

        gsap.killTweensOf(camera.position);
        if (controlsRef.current) gsap.killTweensOf(controlsRef.current.target);

        if (isJump) {
          // Space Jumper Juice 🧃
          const startCam = camera.position.clone();
          const startLook = controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3();
          
          const proxy = { t: 0 };
          gsap.to(proxy, {
            t: 1,
            duration: 1.6,
            ease: "power2.inOut",
            onUpdate: () => {
                // Arc translation
                const currentLook = startLook.clone().lerp(lookTarget, proxy.t);
                
                // Parabolic bow curve: 0 -> 1 -> 0
                const bow = Math.sin(proxy.t * Math.PI); 
                
                const currentCam = startCam.clone().lerp(camPos, proxy.t);
                
                // Pull camera backwards along its view vector dynamically based on the bow
                // distance magnitude roughly matching universe size (15-20 units)
                const pullBackDir = currentCam.clone().normalize();
                currentCam.add(pullBackDir.multiplyScalar(bow * 30));

                camera.position.copy(currentCam);
                if (controlsRef.current) {
                    controlsRef.current.target.copy(currentLook);
                    controlsRef.current.update();
                }
            }
          });
        } else {
          // Normal transition from overview
          gsap.to(camera.position, {
            x: camPos.x,
            y: camPos.y,
            z: camPos.z,
            duration: 1.5,
            ease: "power3.inOut",
            onUpdate: () => controlsRef.current?.update()
          });

          if (controlsRef.current) {
            gsap.to(controlsRef.current.target, {
              x: lookTarget.x,
              y: lookTarget.y,
              z: lookTarget.z,
              duration: 1.5,
              ease: "power3.inOut",
              onUpdate: () => controlsRef.current?.update()
            });
          }
        }
      }
    } else {
      // Reset to overview
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 60,
        duration: 2,
        ease: "power3.inOut",
        onUpdate: () => controlsRef.current?.update()
      });
      
      if (controlsRef.current) {
        gsap.to(controlsRef.current.target, {
          x: 0,
          y: 0,
          z: 0,
          duration: 2,
          ease: "power3.inOut",
          onUpdate: () => controlsRef.current?.update()
        });
      }
    }
    
    prevSelectedId.current = selectedId;
  }, [selectedId, camera, controlsRef, portfolioActive, introStage]);

  return (
    <mesh ref={speedLinesQuadRef} position={[0, 0, 0]} renderOrder={9999}>
      <planeGeometry args={[20, 20]} />
      <shaderMaterial
        side={THREE.DoubleSide}
        ref={speedLinesMatRef}
        transparent
        depthTest={false}
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
          uSpeed: { value: 0 },
          uOpacity: { value: 0 }
        }}
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
          uniform float uSpeed;
          uniform float uOpacity;

          float random(vec2 st) {
              return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
          }

          void main() {
            vec2 centered = vUv - 0.5;
            float angle = atan(centered.y, centered.x);
            float radius = length(centered);
            
            // segment angle
            float segment = floor(angle * 60.0);
            
            // update randomly over time, scaled by speed
            float rTime = floor(uTime * 15.0);
            float isLine = random(vec2(segment, rTime)) > 0.85 ? 1.0 : 0.0;
            
            float centerFade = smoothstep(0.01, 0.4, radius); // fade out near center
            float outerFade = smoothstep(0.5, 0.4, radius); // fade out at edges
            
            float intensity = isLine * centerFade * outerFade * uSpeed * 0.8;
            
            gl_FragColor = vec4(vec3(1.0), intensity * uOpacity * 0.2);
          }
        `}
      />
    </mesh>
  );
}

function ArtworkNode({ 
  artwork, 
  isSelected, 
  onSelect 
}: { 
  artwork: Artwork, 
  isSelected: boolean,
  onSelect: () => void 
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(artwork.imageUrl);

  // Elegant, subtle cyan/emerald glow to match UI
  const glowColor = useMemo(() => new THREE.Color('#38bdf8'), []);
  
  const uniforms = useMemo(() => ({
    uColor: { value: glowColor },
    uOpacity: { value: 0 },
    uTime: { value: 0 }
  }), [glowColor]);

  useEffect(() => {
    document.body.style.cursor = hovered && !isSelected ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, isSelected]);

  useFrame((_, delta) => {
    if (groupRef.current) {
        const targetScale = hovered && !isSelected ? 1.08 : 1;
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 8 * delta);
    }
    const targetOpacity = hovered && !isSelected ? 1.0 : 0.0;
    uniforms.uOpacity.value = THREE.MathUtils.lerp(uniforms.uOpacity.value, targetOpacity, 8 * delta);
    uniforms.uTime.value += delta;

    if (textRef.current && textRef.current.material) {
        const textTargetOp = hovered || isSelected ? 1.0 : 0.0;
        textRef.current.fillOpacity = THREE.MathUtils.lerp(textRef.current.fillOpacity, textTargetOp, 10 * delta);
    }
  });

  return (
    <Float
      speed={2} 
      rotationIntensity={0} 
      floatIntensity={isSelected ? 0.2 : 2}
      position={artwork.position}
    >
      <Trail
        width={hovered ? 2.5 : 1.5}
        length={6}
        color={glowColor}
        attenuation={(t) => t * t}
      >
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <group
            ref={groupRef}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
          >
            {/* Glow effect */}
            <mesh position={[0, 0, -0.1]}>
              <planeGeometry args={[5, 4]} />
              <shaderMaterial 
                side={THREE.DoubleSide}
                vertexShader={`
                  varying vec2 vUv;
                  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
                `}
                fragmentShader={`
                  varying vec2 vUv;
                  uniform vec3 uColor;
                  uniform float uOpacity;
                  uniform float uTime;
                  void main() {
                    // Create a soft glowing aura
                    vec2 d = abs(vUv - 0.5);
                    float boxDist = max(d.x * 0.8, d.y * 1.0); // Adjust ratio based on plane args (5,4)
                    
                    float pulse = sin(uTime * 3.0) * 0.05 + 0.95;
                    float alpha = smoothstep(0.48, 0.2, boxDist) * uOpacity * pulse;
                    
                    // Center core intensity
                    float core = smoothstep(0.35, 0.0, boxDist) * 0.6 * uOpacity;
                    
                    vec3 finalColor = uColor + (vec3(1.0) * core);
                    
                    gl_FragColor = vec4(finalColor, alpha * 0.7);
                  }
                `}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            
            {/* Main Image Plate */}
            <mesh ref={meshRef}>
              <planeGeometry args={[4, 3]} />
              <meshBasicMaterial map={texture} side={THREE.DoubleSide} color={0xffffff} />
            </mesh>

            {/* Title Tag */}
            <Text
              ref={textRef}
              position={[0, -1.8, 0]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
              maxWidth={4}
              fillOpacity={0}
            >
              {artwork.title}
            </Text>
          </group>
        </Billboard>
      </Trail>
    </Float>
  );
}

export function Universe({ 
  selectedId, 
  onSelect, 
  portfolioActive, 
  cinematicMode, 
  introStage, 
  progress,
  artworks: artworksList = defaultArtworksList
}: UniverseProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const worldGroupRef = useRef<THREE.Group>(null);
  const spinSpeed = useRef(0);
  const cinematicTime = useRef(0);
  const [spaceHeld, setSpaceHeld] = useState(false);

  useEffect(() => {
    if (introStage === 'flash') {
      const tl = gsap.timeline();
      
      // Ramp up (0.6s)
      tl.to(spinSpeed, { current: Math.PI * 3.5, duration: 0.6, ease: "power2.inOut" })
        // Speedy plateau (1.0s)
        .to(spinSpeed, { current: Math.PI * 3.5, duration: 1.0, ease: "none" })
        // Slow down and halt (1.0s)
        .to(spinSpeed, { current: 0, duration: 1.0, ease: "power2.inOut" });
    }
  }, [introStage]);

  useEffect(() => {
    if (cinematicMode) {
      cinematicTime.current = 0;
    }
  }, [cinematicMode]);

  useFrame((_, delta) => {
    if (worldGroupRef.current && spinSpeed.current > 0) {
      worldGroupRef.current.rotation.z += spinSpeed.current * delta;
    }
    if (cinematicMode && !selectedId && !portfolioActive && controlsRef.current) {
       cinematicTime.current += delta;
       const t = cinematicTime.current;
       // Slowly oscillate the target slightly for a "drone or steadycam" feel
       const targetX = Math.sin(t * 0.3) * 1.5;
       // ROTATE AND scroll down slowly (very slowly) creates a cinematic effect
       const targetY = Math.cos(t * 0.2) * 1.5 + Math.sin(t * 0.1) * 1.0 - (t * 0.3);
       const targetZ = Math.sin(t * 0.15) * 1.5;
       
       controlsRef.current.target.lerp(new THREE.Vector3(targetX, targetY, targetZ), delta * 2);
       // Also subtly drift camera height constraint
       controlsRef.current.minPolarAngle = Math.PI / 2 + Math.sin(t * 0.1) * 0.2 - 0.15;
       controlsRef.current.maxPolarAngle = Math.PI / 2 + Math.sin(t * 0.1) * 0.2 - 0.15;
       controlsRef.current.update();
    } else if (controlsRef.current && !selectedId && !portfolioActive) {
       // Restore defaults
       controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), delta * 5);
       controlsRef.current.minPolarAngle = 0;
       controlsRef.current.maxPolarAngle = Math.PI;
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <>
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 10, 80]} />
      
      <OrbitControls 
        ref={controlsRef} 
        makeDefault 
        enablePan={false}
        enableRotate={!portfolioActive && !cinematicMode}
        enableZoom={!portfolioActive && !cinematicMode}
        autoRotate={cinematicMode || (spaceHeld && !selectedId && !portfolioActive)}
        autoRotateSpeed={cinematicMode ? 1.5 : 4}
      />

      <CameraController 
        selectedId={selectedId} 
        controlsRef={controlsRef} 
        portfolioActive={portfolioActive} 
        cinematicMode={cinematicMode} 
        introStage={introStage} 
        progress={progress} 
        worldGroupRef={worldGroupRef}
        artworks={artworksList}
      />
      
      <ParallaxStars />
      
      {/* Interactive Cosmic Dust Particle System */}
      <CosmicDust />
      
      <ambientLight intensity={0.5} />
      
      <group ref={worldGroupRef}>
        <ParallaxStars />
        
        {/* Container for drifting slightly if not selected */}
        <group>
          {artworksList.map((art) => (
            <ArtworkNode 
              key={art.id} 
              artwork={art} 
              isSelected={selectedId === art.id}
              onSelect={() => onSelect(art.id)}
            />
          ))}
        </group>
      </group>
    </>
  );
}
