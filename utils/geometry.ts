
/**
 * Generates 2000 points forming a realistic blooming rose shape in 3D space.
 * Uses a layered petal system with golden angle distribution.
 */
export const generateRosePoints = (count: number): Float32Array => {
  const points = new Float32Array(count * 3);
  
  const petalCount = Math.floor(count * 0.75); // 1500 points for the bloom
  const stemCount = Math.floor(count * 0.15);  // 300 points for the stem
  const leafCount = count - petalCount - stemCount; // 200 points for leaves

  let idx = 0;

  // 1. Blooming Flower Petals
  // We simulate about 15-20 individual petals arranged in a spiral
  const petalsTotal = 24;
  const pointsPerPetal = Math.floor(petalCount / petalsTotal);
  const goldenAngle = 137.508 * (Math.PI / 180);

  for (let p = 0; p < petalsTotal; p++) {
    const phi = p * goldenAngle; // Rotation of this petal
    const layer = p / petalsTotal; // 0 = inner, 1 = outer
    
    // Properties based on layer
    const petalSize = 0.5 + layer * 2.5;
    const petalTilt = (Math.PI / 3) * (layer * 1.5); // Tilt outwards
    const baseHeight = 2 + (layer * 0.8);
    const spread = 0.4 + layer * 0.6;

    for (let i = 0; i < pointsPerPetal; i++) {
      // Parametric coordinates for a single petal surface
      const u = Math.random(); // Distance from petal base to tip
      const v = (Math.random() - 0.5) * 2; // Width of the petal (-1 to 1)

      // Base shape of a single petal before rotation/tilt
      // v^2 creates a rounded tip, u creates the length
      let px = v * petalSize * Math.sqrt(u) * spread;
      let py = u * petalSize;
      let pz = (v * v * 0.5 + u * u * 0.3) * petalSize * 0.5; // Curvature

      // Apply tilt (rotate around X-axis)
      const ty = py * Math.cos(petalTilt) - pz * Math.sin(petalTilt);
      const tz = py * Math.sin(petalTilt) + pz * Math.cos(petalTilt);
      py = ty;
      pz = tz;

      // Rotate petal around the center of the rose (Y-axis)
      const finalX = px * Math.cos(phi) + pz * Math.sin(phi);
      const finalZ = -px * Math.sin(phi) + pz * Math.cos(phi);
      const finalY = py + baseHeight;

      points[idx++] = finalX;
      points[idx++] = finalY;
      points[idx++] = finalZ;
    }
  }

  // 2. Stem (Stronger, slightly tapered cylinder)
  for (let i = 0; i < stemCount; i++) {
    const t = i / stemCount;
    const y = 2.2 - (t * 8.5); 
    const radius = 0.08 * (1 - t * 0.3); // Tapers slightly
    const angle = Math.random() * Math.PI * 2;
    
    const x = Math.cos(angle) * radius + 0.15 * Math.sin(y * 0.8);
    const z = Math.sin(angle) * radius + 0.15 * Math.cos(y * 0.8);
    
    points[idx++] = x;
    points[idx++] = y;
    points[idx++] = z;
  }

  // 3. Leaves (Wide, pointed shapes with central veins)
  const leavesToGen = 2;
  const pointsPerLeaf = Math.floor(leafCount / leavesToGen);
  
  for (let l = 0; l < leavesToGen; l++) {
    const side = l === 0 ? 1 : -1;
    const baseY = -1 - l * 1.5;
    const rot = l * Math.PI + (Math.random() - 0.5);

    for (let i = 0; i < pointsPerLeaf; i++) {
      const u = Math.random(); // Length 0 to 1
      const v = (Math.random() - 0.5) * 2; // Width -1 to 1
      
      // Heart-ish leaf shape
      const leafW = (1 - u) * Math.sqrt(u) * 2.5;
      let lx = v * leafW;
      let ly = u * 2;
      let lz = (Math.abs(v) * 0.2); // Midrib fold

      // Tilt leaf down
      const tilt = Math.PI / 4;
      const ty = ly * Math.cos(tilt) - lz * Math.sin(tilt);
      const tz = ly * Math.sin(tilt) + lz * Math.cos(tilt);
      
      // Position on stem and rotate
      const fx = (lx * Math.cos(rot) + tz * Math.sin(rot)) + (0.15 * Math.sin(baseY * 0.8));
      const fz = (-lx * Math.sin(rot) + tz * Math.cos(rot)) + (0.15 * Math.cos(baseY * 0.8));
      const fy = ty + baseY;

      points[idx++] = fx;
      points[idx++] = fy;
      points[idx++] = fz;
    }
  }

  // Fill remaining points with random noise near center if any left (safety)
  while(idx < count * 3) {
    points[idx++] = (Math.random() - 0.5) * 0.1;
  }

  return points;
};

/**
 * Generates random points within a sphere for initial state.
 */
export const generateRandomPoints = (count: number, radius: number): Float32Array => {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * Math.pow(Math.random(), 1/3);
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = 2 * Math.PI * Math.random();

    points[i * 3] = r * Math.sin(theta) * Math.cos(phi);
    points[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    points[i * 3 + 2] = r * Math.cos(theta);
  }
  return points;
};
