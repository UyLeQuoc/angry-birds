export const Level5 = {
  levelNumber: 5,
  name: 'Final Showdown',
  birds: [
    { type: 'RED', position: { x: -8, y: 1, z: 0 } },
    { type: 'BLUE', position: { x: -10, y: 0.5, z: 0 } },
    { type: 'BOMB', position: { x: -11, y: 0.5, z: 0 } },
    { type: 'RED', position: { x: -12, y: 0.5, z: 0 } },
    { type: 'BLUE', position: { x: -13, y: 0.5, z: 0 } },
  ],
  pigs: [
    { position: { x: 8, y: 4.5, z: 0 }, size: 0.5 }, // Boss pig
    { position: { x: 10, y: 0.6, z: 0 }, size: 0.4 },
    { position: { x: 12, y: 2.5, z: 0 }, size: 0.4 },
    { position: { x: 14, y: 0.6, z: 0 }, size: 0.4 },
  ],
  structures: [
    // Massive fortress
    // Base - on ground
    { type: 'STONE_LARGE', position: { x: 7, y: 0.2, z: 0 } },
    { type: 'STONE_LARGE', position: { x: 9, y: 0.2, z: 0 } },
    { type: 'STONE_LARGE', position: { x: 11, y: 0.2, z: 0 } },
    { type: 'STONE_LARGE', position: { x: 13, y: 0.2, z: 0 } },
    
    // Left tower - adjusted to stack properly
    { type: 'STONE_MEDIUM', position: { x: 7, y: 0.65, z: 0 } },
    { type: 'STONE_MEDIUM', position: { x: 7, y: 1.55, z: 0 } },
    { type: 'STONE_MEDIUM', position: { x: 7, y: 2.45, z: 0 } },
    { type: 'STONE_MEDIUM', position: { x: 7, y: 3.35, z: 0 } },
    { type: 'WOOD_LARGE', position: { x: 7.5, y: 4.05, z: 0 } },
    
    // Center-left structure - on base
    { type: 'WOOD_SMALL', position: { x: 9, y: 0.65, z: 0 } },
    { type: 'WOOD_SMALL', position: { x: 11, y: 0.65, z: 0 } },
    { type: 'WOOD_LARGE', position: { x: 10, y: 1.15, z: 0 } },
    
    // Center-right structure - stacked properly
    { type: 'GLASS_SMALL', position: { x: 12, y: 1.65, z: 0 } },
    { type: 'GLASS_LARGE', position: { x: 12, y: 2.15, z: 0 } },
    
    // Right tower - adjusted
    { type: 'STONE_MEDIUM', position: { x: 14, y: 0.65, z: 0 } },
    { type: 'STONE_MEDIUM', position: { x: 14, y: 1.55, z: 0 } },
    { type: 'WOOD_MEDIUM', position: { x: 14, y: 2.45, z: 0 } },
    
    // Top layer - supported properly
    { type: 'WOOD_LARGE', position: { x: 9, y: 1.9, z: 0 } },
    { type: 'WOOD_LARGE', position: { x: 11, y: 1.9, z: 0 } },
    { type: 'GLASS_LARGE', position: { x: 10, y: 2.65, z: 0 } },
  ],
  slingshotPosition: { x: -8, y: 0, z: 0 },
  cameraPosition: { x: 3, y: 6, z: 18 },
};

