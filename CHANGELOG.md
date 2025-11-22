# 📝 Changelog - Vibe Angry Birds

## [v1.1.0] - Bug Fixes & Visual Improvements

### 🐛 Bug Fixes

#### 1. Fixed Blocks Falling Down at Start
**Problem**: Blocks tự động rơi xuống khi vào màn chơi
**Solution**: 
- Set blocks to sleep state initially
- Configure sleep parameters (sleepSpeedLimit: 0.1, sleepTimeLimit: 0.1)
- Blocks now stay stable until hit by birds
- File changed: `src/entities/Block.js`

#### 2. Fixed Bird Not Auto-Loading
**Problem**: Sau khi bắn bird, game không tự động nạp bird tiếp theo
**Solution**:
- Added continuous `checkLevelComplete()` in main update loop
- Added flags: `loadingNextBird` and `levelCompleting` to prevent duplicate calls
- Increased delay to 2 seconds for better UX
- Bird now auto-loads after previous bird goes to sleep
- Files changed: `src/core/Game.js`

#### 3. Fixed Input/Drag System
**Problem**: Không thể kéo thả bird
**Solution**:
- Fixed `getWorldPosition()` to raycast to z=0 plane
- Increased grab radius from 2 to 3 units
- Added comprehensive console logging for debugging
- Added null checks for slingshot and canvas
- Files changed: `src/input/InputManager.js`, `src/core/Game.js`

### 🎨 Visual Improvements

#### Enhanced Sky Shader
**Before**: Simple gradient with basic clouds
**After**: 
- Multi-layer gradient (3 color stops: top, middle, bottom)
- Large fluffy clouds with depth and shadows
- Small wispy clouds for detail
- Sun glow effect at top
- Atmospheric haze at horizon
- Animated shimmer effect
- 6 octaves of FBM noise (increased from 4)
- File changed: `src/shaders/sky.frag`

#### Improved Parallax Layers
**Before**: 2 simple hill layers
**After**: 5 detailed layers
1. **Distant Mountains** - Blue tinted, far background
2. **Far Hills** - Light green with trees
3. **Near Hills** - Darker green, closer
4. **Foreground Bushes** - Dark green, closest
5. Each layer with different parallax speeds for depth

**New Geometry Functions**:
- `createMountainGeometry()` - Sharp peaks
- `createHillGeometry()` - Smooth rolling hills with multiple sine waves
- `createBushGeometry()` - Bumpy bush shapes
- File changed: `src/rendering/SceneManager.js`

#### Beautiful Ground Texture
**Before**: Brown with simple green patches
**After**:
- Base dirt color (#6B5839)
- 800 varied grass patches in multiple green shades
- 50 colorful flowers (yellow, pink, red, white)
- 100 dirt patches for texture variety
- Random grass blade shapes (squares and circles)
- File changed: `src/utils/AssetLoader.js`

### 📊 Performance Impact
- Build size: ~705KB (~191KB gzipped) - Minimal increase
- FPS: Still targets 60 FPS
- Additional shader complexity: Negligible impact due to GPU optimization

### 🎮 Gameplay Improvements
- **Better Bird Loading**: 2-second delay feels more natural
- **Stable Structures**: No more collapsing towers at start
- **Easier Grabbing**: 50% larger grab radius (2→3 units)
- **Debug Info**: Console logs help troubleshoot issues

### 🎨 Visual Quality
- **Sky**: Professional-grade procedural sky with realistic clouds
- **Depth**: 5-layer parallax creates strong sense of depth
- **Ground**: Detailed grass texture with flowers
- **Overall**: Game looks significantly more polished

### 🔧 Technical Details

#### Physics Sleep Configuration
```javascript
body.sleep();
body.allowSleep = true;
body.sleepSpeedLimit = 0.1;
body.sleepTimeLimit = 0.1;
```

#### Raycasting Fix
```javascript
// Cast to z=0 plane instead of arbitrary distance
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
raycaster.ray.intersectPlane(plane, target);
```

#### Game Loop Check
```javascript
// Continuous level completion checking
if (this.currentLevel && !this.levelCompleting) {
  this.checkLevelComplete();
}
```

### 📝 Files Modified
- ✅ `src/entities/Block.js` - Physics sleep
- ✅ `src/core/Game.js` - Bird loading logic + input fixes
- ✅ `src/input/InputManager.js` - Raycasting fix
- ✅ `src/shaders/sky.frag` - Enhanced sky shader
- ✅ `src/rendering/SceneManager.js` - Parallax layers
- ✅ `src/utils/AssetLoader.js` - Ground texture
- ✅ `index.html` - CSS fix
- ✅ `vite.config.js` - Shader loading
- ✅ `package.json` - Removed glsl plugin

### 🎯 Testing Checklist
- [x] Blocks stay in place at level start
- [x] Bird auto-loads after previous bird sleeps
- [x] Can drag and release bird
- [x] Sky shows beautiful clouds
- [x] Parallax layers visible and moving
- [x] Ground has grass texture
- [x] Game builds successfully
- [x] No console errors

### 🚀 How to Test
```bash
# Install dependencies (if needed)
npm install

# Run dev server
npm run dev

# Play Level 1
# 1. Click "PLAY"
# 2. Click level "1"
# 3. Skip cutscene (click)
# 4. Try dragging the bird
# 5. Watch bird auto-load after shot
# 6. Observe beautiful background!
```

### 📸 Visual Comparisons

#### Sky
- Before: Simple blue gradient, faint clouds
- After: Multi-tone sky, puffy 3D-looking clouds, sun glow, atmospheric haze

#### Background
- Before: 2 flat green hills
- After: Mountains, multiple hill layers, bushes - feels like a real landscape

#### Ground
- Before: Brown with dots
- After: Detailed grass with multiple shades, flowers, dirt patches

### 💡 Tips for Further Customization

#### Want more/different clouds?
Edit `src/shaders/sky.frag`:
- Adjust `cloudUv1` and `cloudUv2` scale for cloud size
- Change `uTime` multipliers for cloud speed
- Modify `smoothstep` values for cloud density

#### Want different landscape?
Edit `src/rendering/SceneManager.js`:
- Adjust colors in `createParallaxLayers()`
- Change wave frequencies in geometry functions
- Add more layers (just duplicate pattern)

#### Want different ground?
Edit `src/utils/AssetLoader.js`:
- Change base colors
- Adjust number of grass patches
- Add/remove flowers
- Modify dirt patches

---

**All bugs fixed! Game is now more polished and playable! 🎉**

Run `npm run dev` and enjoy the improvements! 🐦🎯

