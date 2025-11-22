export const Level4 = {
  levelNumber: 4,
  name: 'Pig Palace',
  birds: [
    { type: 'RED', position: { x: -8, y: 1, z: 0 } },
    { type: 'BLUE', position: { x: -10, y: 0.5, z: 0 } },
    { type: 'BOMB', position: { x: -11, y: 0.5, z: 0 } },
    { type: 'RED', position: { x: -12, y: 0.5, z: 0 } },
  ],
  pigs: [
    { position: { x: 8, y: 0.6, z: 0 }, size: 0.4 },
    { position: { x: 10, y: 2.5, z: 0 }, size: 0.4 },
    { position: { x: 12, y: 0.6, z: 0 }, size: 0.4 },
  ],
  structures: [
    // Left tower - adjusted heights
    { type: 'STONE_MEDIUM', position: { x: 7, y: 0.4, z: 0 } },
    { type: 'STONE_MEDIUM', position: { x: 7, y: 1.4, z: 0 } },
    { type: 'WOOD_LARGE', position: { x: 8, y: 2.15, z: 0 } },
    
    // Center tower - ground-based
    { type: 'WOOD_SMALL', position: { x: 9, y: 0.4, z: 0 } },
    { type: 'WOOD_SMALL', position: { x: 11, y: 0.4, z: 0 } },
    { type: 'WOOD_LARGE', position: { x: 10, y: 1.15, z: 0 } },
    { type: 'GLASS_SMALL', position: { x: 10, y: 1.9, z: 0 } },
    
    // Right tower - adjusted heights
    { type: 'STONE_MEDIUM', position: { x: 13, y: 0.4, z: 0 } },
    { type: 'STONE_MEDIUM', position: { x: 13, y: 1.4, z: 0 } },
    { type: 'WOOD_LARGE', position: { x: 12, y: 2.15, z: 0 } },
    
    // Connecting beams - supported by towers
    { type: 'GLASS_LARGE', position: { x: 9, y: 2.9, z: 0 } },
    { type: 'GLASS_LARGE', position: { x: 11, y: 2.9, z: 0 } },
  ],
  slingshotPosition: { x: -8, y: 0, z: 0 },
  cameraPosition: { x: 2, y: 5, z: 15 },
};

