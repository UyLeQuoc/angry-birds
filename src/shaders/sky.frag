uniform float uTime;
uniform vec3 uColorTop;
uniform vec3 uColorBottom;

varying vec2 vUv;
varying vec3 vPosition;

// Improved noise functions
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    value += amplitude * noise(st * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  // More vibrant gradient
  vec3 skyTop = vec3(0.2, 0.5, 0.95);      // Deep blue
  vec3 skyMidTop = vec3(0.4, 0.7, 1.0);    // Sky blue
  vec3 skyMidBottom = vec3(0.7, 0.85, 0.98); // Light blue
  vec3 skyBottom = vec3(0.92, 0.93, 0.96);  // Almost white at horizon
  
  float gradientPos = vUv.y;
  vec3 color;
  
  // Smoother 3-stop gradient
  if (gradientPos > 0.66) {
    color = mix(skyMidTop, skyTop, (gradientPos - 0.66) * 3.0);
  } else if (gradientPos > 0.33) {
    color = mix(skyMidBottom, skyMidTop, (gradientPos - 0.33) * 3.0);
  } else {
    color = mix(skyBottom, skyMidBottom, gradientPos * 3.0);
  }
  
  // Large fluffy clouds with more variation
  vec2 cloudUv1 = vUv * 2.8;
  cloudUv1.x += uTime * 0.012;
  cloudUv1.y += sin(uTime * 0.08) * 0.04;
  float cloudNoise1 = fbm(cloudUv1);
  float cloudMask1 = smoothstep(0.48, 0.72, cloudNoise1);
  cloudMask1 *= smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
  
  // Medium clouds
  vec2 cloudUv2 = vUv * 4.5;
  cloudUv2.x += uTime * 0.02;
  float cloudNoise2 = fbm(cloudUv2);
  float cloudMask2 = smoothstep(0.52, 0.68, cloudNoise2);
  cloudMask2 *= smoothstep(0.15, 0.45, vUv.y) * smoothstep(1.0, 0.65, vUv.y);
  
  // Small wispy clouds
  vec2 cloudUv3 = vUv * 6.0;
  cloudUv3.x += uTime * 0.03;
  float cloudNoise3 = fbm(cloudUv3);
  float cloudMask3 = smoothstep(0.55, 0.65, cloudNoise3);
  cloudMask3 *= smoothstep(0.25, 0.55, vUv.y) * smoothstep(1.0, 0.75, vUv.y);
  
  // Cloud colors with more depth
  vec3 cloudBright = vec3(1.0, 1.0, 1.0);
  vec3 cloudMid = vec3(0.92, 0.94, 0.96);
  vec3 cloudDark = vec3(0.75, 0.8, 0.88);
  
  // Add cloud shadows for depth
  float cloudDepth = fbm(cloudUv1 * 1.3 + vec2(0.15, 0.12));
  vec3 finalCloudColor = mix(cloudDark, cloudBright, smoothstep(0.25, 0.75, cloudDepth));
  finalCloudColor = mix(finalCloudColor, cloudMid, 0.3);
  
  // Blend clouds with sky (more prominent)
  color = mix(color, finalCloudColor, cloudMask1 * 0.7);
  color = mix(color, cloudBright, cloudMask2 * 0.4);
  color = mix(color, cloudMid, cloudMask3 * 0.25);
  
  // Warmer sun glow at top
  float sunGlow = pow(smoothstep(0.6, 1.0, vUv.y), 1.8);
  color += vec3(1.0, 0.9, 0.7) * sunGlow * 0.08;
  
  // Atmospheric perspective with warmth
  float haze = pow(1.0 - vUv.y, 2.5);
  vec3 hazeColor = vec3(0.95, 0.96, 0.98);
  color = mix(color, hazeColor, haze * 0.2);
  
  // Subtle color variation
  float colorVar = noise(vUv * 8.0 + uTime * 0.01);
  color += vec3(colorVar * 0.015);
  
  gl_FragColor = vec4(color, 1.0);
}

