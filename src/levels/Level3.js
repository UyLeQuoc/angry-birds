export const Level3 = {
  levelNumber: 3,
  name: 'The Fortress',
  birds: [
    { type: 'RED', position: { x: -8, y: 1, z: 0 } },
    { type: 'RED', position: { x: -10, y: 0.5, z: 0 } },
    { type: 'BLUE', position: { x: -11, y: 0.5, z: 0 } },
    { type: 'BOMB', position: { x: -12, y: 0.5, z: 0 } },
  ],
  pigs: [
    { position: { x: 8, y: 3.5, z: 0 }, size: 0.4 },
    { position: { x: 11, y: 0.6, z: 0 }, size: 0.4 },
  ],
  structures: [
    // Base platform (adjusted to ground level)
    { type: 'STONE_LARGE', position: { x: 7, y: 0.4, z: 0 } },
    { type: 'STONE_LARGE', position: { x: 9, y: 0.4, z: 0 } },
    
    // Left wall (adjusted heights for proper stacking)
    { type: 'STONE_SMALL', position: { x: 6, y: 0.4, z: 0 } },
    { type: 'STONE_SMALL', position: { x: 6, y: 1.2, z: 0 } },
    { type: 'STONE_SMALL', position: { x: 6, y: 2.0, z: 0 } },
    { type: 'STONE_SMALL', position: { x: 6, y: 2.8, z: 0 } },
    
    // Right wall (adjusted heights for proper stacking)
    { type: 'STONE_SMALL', position: { x: 10, y: 0.4, z: 0 } },
    { type: 'STONE_SMALL', position: { x: 10, y: 1.2, z: 0 } },
    { type: 'STONE_SMALL', position: { x: 10, y: 2.0, z: 0 } },
    { type: 'STONE_SMALL', position: { x: 10, y: 2.8, z: 0 } },
    
    // Top platform (resting on walls)
    { type: 'WOOD_LARGE', position: { x: 8, y: 3.4, z: 0 } },
    
    // Side structure (ground-based)
    { type: 'WOOD_SMALL', position: { x: 11, y: 0.4, z: 0 } },
    { type: 'WOOD_SMALL', position: { x: 11, y: 1.2, z: 0 } },
  ],
  slingshotPosition: { x: -8, y: 0, z: 0 },
  cameraPosition: { x: 0, y: 5, z: 15 },
};

