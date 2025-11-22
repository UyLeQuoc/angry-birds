export const Level2 = {
  levelNumber: 2,
  name: 'Glass Castle',
  birds: [
    { type: 'RED', position: { x: -8, y: 1, z: 0 } },
    { type: 'BLUE', position: { x: -10, y: 0.5, z: 0 } },
    { type: 'BOMB', position: { x: -11, y: 0.5, z: 0 } },
  ],
  pigs: [
    { position: { x: 8, y: 0.6, z: 0 }, size: 0.4 },
    { position: { x: 10, y: 0.6, z: 0 }, size: 0.4 },
  ],
  structures: [
    // Left tower (glass)
    { type: 'GLASS_SMALL', position: { x: 7, y: 0.5, z: 0 } },
    { type: 'GLASS_SMALL', position: { x: 7, y: 1.5, z: 0 } },
    { type: 'GLASS_LARGE', position: { x: 7.5, y: 2.25, z: 0 } },
    
    // Right tower (glass)
    { type: 'GLASS_SMALL', position: { x: 9, y: 0.5, z: 0 } },
    { type: 'GLASS_SMALL', position: { x: 9, y: 1.5, z: 0 } },
    { type: 'GLASS_LARGE', position: { x: 8.5, y: 2.25, z: 0 } },
    
    // Roof
    { type: 'WOOD_LARGE', position: { x: 8, y: 3, z: 0 } },
  ],
  slingshotPosition: { x: -8, y: 0, z: 0 },
  cameraPosition: { x: 0, y: 5, z: 15 },
};

