export const Level1 = {
  levelNumber: 1,
  name: 'Getting Started',
  birds: [
    { type: 'RED', position: { x: -8, y: 1, z: 0 } },
    { type: 'BLUE', position: { x: -10, y: 0.5, z: 0 } },
  ],
  pigs: [
    { position: { x: 8, y: 0.6, z: 0 }, size: 0.4 },
  ],
  structures: [
    // Simple tower
    { type: 'WOOD_SMALL', position: { x: 7, y: 0.5, z: 0 } },
    { type: 'WOOD_SMALL', position: { x: 9, y: 0.5, z: 0 } },
    { type: 'WOOD_LARGE', position: { x: 8, y: 1.25, z: 0 } },
    { type: 'WOOD_SMALL', position: { x: 7, y: 2, z: 0 } },
    { type: 'WOOD_SMALL', position: { x: 9, y: 2, z: 0 } },
    { type: 'WOOD_LARGE', position: { x: 8, y: 2.75, z: 0 } },
  ],
  slingshotPosition: { x: -8, y: 0, z: 0 },
  cameraPosition: { x: 0, y: 5, z: 15 },
};

