import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

interface CosmicDustProps {
  count?: number;
  radius?: number;
}

// Generate a high-resolution glowing soft circular particle texture
function createDustParticleTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Crisp, delicate pinpoint stardust mote with compact subtle aura
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 22);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.14, 'rgba(240, 250, 255, 0.85)');
  gradient.addColorStop(0.35, 'rgba(150, 215, 255, 0.22)');
  gradient.addColorStop(0.65, 'rgba(90, 150, 240, 0.03)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function CosmicDust({ count = 1400, radius = 42 }: CosmicDustProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera, raycaster, pointer } = useThree();
  const pointerActive = useRef(false);

  // Track pointer presence
  useEffect(() => {
    const onPointerMove = () => {
      pointerActive.current = true;
    };
    const onPointerLeave = () => {
      pointerActive.current = false;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('touchstart', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchstart', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
    };
  }, []);

  // Pre-generate particle buffers and dynamic physical properties
  const { 
    geometry, 
    originalPositions, 
    currentPositions, 
    velocities, 
    frequencies, 
    amplitudes, 
    phases,
    dustTexture 
  } = useMemo(() => {
    const texture = createDustParticleTexture();

    const origPos = new Float32Array(count * 3);
    const currPos = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const freqs = new Float32Array(count);
    const amps = new Float32Array(count);
    const phs = new Float32Array(count * 3);

    // Ethereal space color palette: cyans, lavenders, silvers, golds, soft auroras
    const palette = [
      new THREE.Color(0.35, 0.85, 1.0),   // Electric Cyan
      new THREE.Color(0.50, 0.75, 1.0),   // Star Blue
      new THREE.Color(0.82, 0.60, 1.0),   // Nebula Lavender
      new THREE.Color(0.98, 0.88, 0.55),  // Cosmic Amber / Gold
      new THREE.Color(0.40, 0.95, 0.75),  // Aurora Mint
      new THREE.Color(0.95, 0.98, 1.0),   // Pure Star White
      new THREE.Color(0.65, 0.90, 1.0),   // Soft Sky
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Spherical distribution with volume bias for realistic cosmic dust clouds
      const u = Math.random();
      const dist = Math.cbrt(u) * radius + 4; // avoid dead center, spread up to radius
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = dist * Math.sin(phi) * Math.cos(theta);
      const y = dist * Math.sin(phi) * Math.sin(theta) * 0.75; // slightly flatter disc
      const z = dist * Math.cos(phi);

      origPos[i3] = x;
      origPos[i3 + 1] = y;
      origPos[i3 + 2] = z;

      currPos[i3] = x;
      currPos[i3 + 1] = y;
      currPos[i3 + 2] = z;

      vels[i3] = 0;
      vels[i3 + 1] = 0;
      vels[i3 + 2] = 0;

      // Color selection with subtle variations
      const baseColor = palette[Math.floor(Math.random() * palette.length)];
      const lightnessVariation = 0.85 + Math.random() * 0.3;
      colors[i3] = Math.min(1.0, baseColor.r * lightnessVariation);
      colors[i3 + 1] = Math.min(1.0, baseColor.g * lightnessVariation);
      colors[i3 + 2] = Math.min(1.0, baseColor.b * lightnessVariation);

      // Micro-current floating harmonics (calm, subtle celestial drift)
      freqs[i] = 0.25 + Math.random() * 0.45;
      amps[i] = 0.22 + Math.random() * 0.42;
      phs[i3] = Math.random() * Math.PI * 2;
      phs[i3 + 1] = Math.random() * Math.PI * 2;
      phs[i3 + 2] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(currPos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return {
      geometry: geo,
      originalPositions: origPos,
      currentPositions: currPos,
      velocities: vels,
      frequencies: freqs,
      amplitudes: amps,
      phases: phs,
      dustTexture: texture,
    };
  }, [count, radius]);

  // Clean up texture & geometry on unmount
  useEffect(() => {
    return () => {
      dustTexture.dispose();
      geometry.dispose();
    };
  }, [dustTexture, geometry]);

  // Physics simulation loop
  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Clamp delta to prevent physics jumps on frame drop / tab switch
    const dt = Math.min(delta, 0.04);
    const dtFactor = dt * 60; // normalized to 60fps
    const time = state.clock.getElapsedTime();

    // Raycast from camera using mouse pointer coordinates
    let rayOrigin: THREE.Vector3 | null = null;
    let rayDir: THREE.Vector3 | null = null;

    if (pointerActive.current) {
      raycaster.setFromCamera(pointer, camera);
      rayOrigin = raycaster.ray.origin;
      rayDir = raycaster.ray.direction;
    }

    const ox = rayOrigin ? rayOrigin.x : 0;
    const oy = rayOrigin ? rayOrigin.y : 0;
    const oz = rayOrigin ? rayOrigin.z : 0;

    const rdx = rayDir ? rayDir.x : 0;
    const rdy = rayDir ? rayDir.y : 0;
    const rdz = rayDir ? rayDir.z : 0;

    const hasRay = rayOrigin !== null && rayDir !== null;

    // Subtle simulation constants
    const BASE_REPEL_RADIUS = 2.4; // Compact 3D interaction radius around cursor ray
    const REPEL_FORCE = 0.11;      // Very gentle, subtle outward impulse
    const SWIRL_FORCE = 0.035;     // Gentle micro-curl
    const SPRING_K = 0.065;        // Snappy, calm return force back into place
    const DAMPING = 0.885;         // Smooth damping (no lingering shake)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      let px = currentPositions[i3];
      let py = currentPositions[i3 + 1];
      let pz = currentPositions[i3 + 2];

      // 1. Natural zero-g harmonic orbital float
      const f = frequencies[i];
      const a = amplitudes[i];
      const floatX = Math.sin(time * f + phases[i3]) * a;
      const floatY = Math.cos(time * f * 0.85 + phases[i3 + 1]) * a;
      const floatZ = Math.sin(time * f * 0.7 + phases[i3 + 2]) * a;

      const targetX = originalPositions[i3] + floatX;
      const targetY = originalPositions[i3 + 1] + floatY;
      const targetZ = originalPositions[i3 + 2] + floatZ;

      // 2. Mouse cursor ray repulsion & swirl
      if (hasRay) {
        // Vector from ray origin to particle
        const vx = px - ox;
        const vy = py - oy;
        const vz = pz - oz;

        // Projection length along ray direction
        const t = vx * rdx + vy * rdy + vz * rdz;

        // Only interact if particle is in front of the camera (t > 1.5)
        if (t > 1.5) {
          // Closest point on ray to particle
          const qx = ox + t * rdx;
          const qy = oy + t * rdy;
          const qz = oz + t * rdz;

          // Vector from ray line to particle
          const diffX = px - qx;
          const diffY = py - qy;
          const diffZ = pz - qz;

          const distSq = diffX * diffX + diffY * diffY + diffZ * diffZ;

          // Subtle interaction radius with gentle depth scaling
          const interactionRadius = BASE_REPEL_RADIUS + t * 0.018;
          const radiusSq = interactionRadius * interactionRadius;

          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const invDist = 1.0 / (dist + 0.001);

            // Normalized radial direction away from cursor
            const nx = diffX * invDist;
            const ny = diffY * invDist;
            const nz = diffZ * invDist;

            // Smooth cubic proximity falloff for ultra-soft feathering
            const proximity = 1.0 - dist / interactionRadius;
            const push = proximity * proximity * REPEL_FORCE * dtFactor;

            velocities[i3] += nx * push;
            velocities[i3 + 1] += ny * push;
            velocities[i3 + 2] += nz * push;

            // Tangential swirl force (perpendicular curl around the ray)
            const crossX = rdy * nz - rdz * ny;
            const crossY = rdz * nx - rdx * nz;
            const crossZ = rdx * ny - rdy * nx;

            const swirl = proximity * SWIRL_FORCE * dtFactor;
            velocities[i3] += crossX * swirl;
            velocities[i3 + 1] += crossY * swirl;
            velocities[i3 + 2] += crossZ * swirl;
          }
        }
      }

      // 3. Spring recovery toward original floating anchor ("falls back into place")
      const springX = (targetX - px) * SPRING_K;
      const springY = (targetY - py) * SPRING_K;
      const springZ = (targetZ - pz) * SPRING_K;

      velocities[i3] += springX * dtFactor;
      velocities[i3 + 1] += springY * dtFactor;
      velocities[i3 + 2] += springZ * dtFactor;

      // 4. Damping / air resistance
      velocities[i3] *= DAMPING;
      velocities[i3 + 1] *= DAMPING;
      velocities[i3 + 2] *= DAMPING;

      // 5. Update position
      px += velocities[i3] * dtFactor;
      py += velocities[i3 + 1] * dtFactor;
      pz += velocities[i3 + 2] * dtFactor;

      currentPositions[i3] = px;
      currentPositions[i3 + 1] = py;
      currentPositions[i3 + 2] = pz;
    }

    // Flag buffer attribute for GPU upload
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.28}
        map={dustTexture}
        vertexColors
        transparent
        opacity={0.72}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
