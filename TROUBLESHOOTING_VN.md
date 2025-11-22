# 🔧 Hướng Dẫn Sửa Lỗi

## Lỗi: Không kéo thả bird được

### Kiểm tra Console
1. Mở browser console (F12)
2. Chạy game và thử kéo bird
3. Xem log để kiểm tra:
   - "Drag start" có xuất hiện không?
   - worldPos có giá trị hợp lý không?
   - "Distance to slingshot" là bao nhiêu?

### Nguyên nhân có thể:
1. **Canvas không nhận events**: Check xem canvas có pointer-events
2. **Camera position sai**: Bird và slingshot ở z=0, camera phải nhìn đúng
3. **Slingshot chưa khởi tạo**: Check console log
4. **Game đang pause**: UI state không đúng

### Cách sửa:

#### 1. Kiểm tra canvas events
```javascript
// Trong browser console:
const canvas = document.getElementById('game-canvas');
console.log('Canvas:', canvas);
console.log('Canvas style:', window.getComputedStyle(canvas).pointerEvents);
```

#### 2. Test input trực tiếp
```javascript
// Trong browser console:
window.game.inputManager.on('dragStart', (pos) => {
  console.log('TEST DRAG:', pos);
});
```

#### 3. Kiểm tra slingshot
```javascript
// Trong browser console:
console.log('Slingshot:', window.game.slingshot);
console.log('Current bird:', window.game.currentBird);
console.log('Is paused:', window.game.isPaused);
```

## Lỗi: UI không hiện

### Kiểm tra:
1. Element có tồn tại không:
```javascript
console.log('UI overlay:', document.getElementById('ui-overlay'));
console.log('Loading screen:', document.getElementById('loading-screen'));
```

2. CSS đã load chưa:
```javascript
console.log('Styles:', document.styleSheets);
```

### Cách sửa:
- Xóa cache: Ctrl + Shift + R
- Kiểm tra file `src/styles/main.css` có tồn tại
- Check network tab xem file CSS có load thành công

## Lỗi: Shader không hoạt động

### Triệu chứng:
- Console báo lỗi shader compilation
- Sky không có màu gradient
- Background đen/trắng

### Cách sửa:
1. Kiểm tra import shader:
```javascript
// Phải có ?raw ở cuối
import skyVertexShader from '../shaders/sky.vert?raw';
```

2. Kiểm tra WebGL support:
```javascript
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2');
console.log('WebGL2 supported:', !!gl);
```

## Lỗi: Physics không hoạt động

### Triệu chứng:
- Bird bay thẳng, không rơi
- Block không va chạm
- Everything floats

### Cách sửa:
1. Kiểm tra physics world:
```javascript
console.log('Physics world:', window.game.physicsWorld);
console.log('Bodies:', window.game.physicsWorld.bodies.size);
```

2. Check gravity:
```javascript
console.log('Gravity:', window.game.physicsWorld.world.gravity);
// Phải là (0, -9.82, 0)
```

## Lỗi: FPS thấp

### Cách tối ưu:
1. Giảm shadow quality trong SceneManager.js
2. Giảm số particle
3. Disable performance monitor nếu đang bật
4. Check số lượng entities:
```javascript
console.log('Birds:', window.game.birds.length);
console.log('Pigs:', window.game.pigs.length);
console.log('Blocks:', window.game.blocks.length);
```

## Test Nhanh

### Test Three.js:
```bash
# Mở test-simple.html
http://localhost:3000/test-simple.html
```

Nếu thấy cube xanh quay → Three.js OK

### Test Input:
```javascript
// Console:
document.addEventListener('mousemove', (e) => {
  console.log('Mouse:', e.clientX, e.clientY);
});
```

### Test Physics:
```javascript
// Console:
const testBody = window.game.physicsWorld.bodies.values().next().value;
console.log('Test body velocity:', testBody.velocity);
```

## Commands Hữu Ích

### Restart game:
```javascript
window.location.reload();
```

### Enable FPS counter:
```javascript
window.game.performanceMonitor.enable(true);
```

### Get current state:
```javascript
console.log('Game state:', {
  isRunning: window.game.isRunning,
  isPaused: window.game.isPaused,
  currentLevel: window.game.currentLevel,
  score: window.game.score
});
```

### Force level load:
```javascript
window.game.startLevel(1);  // Load level 1
```

## Liên hệ

Nếu vẫn không được, tạo issue với:
1. Browser version
2. Console errors (copy tất cả)
3. Screenshots
4. Steps để reproduce lỗi

