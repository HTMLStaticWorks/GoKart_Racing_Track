/*
  Go-Kart Racing Track - Three.js Scene
  Draws an interactive 3D wireframe racing track loop with flowing particles,
  a carbon-fiber-like grid floor, and interactive spotlight following the mouse.
*/

let threeScene, threeCamera, threeRenderer;
let trackLine, gridFloor, lightFollower;
let particleSystem;
const particleCount = 40;
let trackSpline;
const carPositions = []; // To keep track of progress of each particle along the loop
const carSpeeds = [];

document.addEventListener('DOMContentLoaded', () => {
  initThreeJS();
  animateThreeJS();
  
  // Watch for theme change events to alter 3D lighting/neon colors
  window.addEventListener('themechanged', (e) => {
    updateThreeColors(e.detail.theme);
  });
});

function initThreeJS() {
  // Check if THREE is loaded from CDN
  if (typeof THREE === 'undefined') return;

  // Create canvas container if not exists
  let canvas = document.getElementById('three-bg-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'three-bg-canvas';
    document.body.prepend(canvas);
  }

  // Scene setup
  threeScene = new THREE.Scene();
  threeScene.fog = new THREE.FogExp2(0x0a0a0a, 0.015);

  // Camera setup - positioned slightly tilted down for depth
  threeCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  threeCamera.position.set(0, 45, 80);
  threeCamera.lookAt(0, 0, -10);

  // Renderer setup
  threeRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 1. Interactive Spotlight following the mouse
  lightFollower = new THREE.PointLight(0xff2a2a, 12, 120);
  lightFollower.position.set(0, 20, 0);
  threeScene.add(lightFollower);

  // Ambient fill lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
  threeScene.add(ambientLight);

  // General blue/red background lighting
  const sideLight1 = new THREE.DirectionalLight(0xe10600, 0.35);
  sideLight1.position.set(100, 50, 50);
  threeScene.add(sideLight1);

  // 2. Carbon-Fiber-Like Wireframe Grid Floor
  const gridHelper = new THREE.GridHelper(200, 40, 0xff2a2a, 0x1c1c1c);
  gridHelper.position.y = -10;
  threeScene.add(gridHelper);
  gridFloor = gridHelper;

  // 3. Glowing 3D Spline Track Layout
  // Points that represent a looping racetrack curves
  const trackPoints = [
    new THREE.Vector3(-45, -5, -30),
    new THREE.Vector3(-25, 2, -45),
    new THREE.Vector3(15, -2, -40),
    new THREE.Vector3(40, 5, -20),
    new THREE.Vector3(45, -3, 10),
    new THREE.Vector3(25, 8, 30),
    new THREE.Vector3(-10, -5, 20),
    new THREE.Vector3(-35, 4, 35),
    new THREE.Vector3(-50, 0, 5),
  ];
  
  // Make it a closed loop spline
  trackSpline = new THREE.CatmullRomCurve3(trackPoints, true);
  
  // Tube geometry for the track wireframe
  const tubeGeometry = new THREE.TubeGeometry(trackSpline, 100, 1.2, 8, true);
  const tubeMaterial = new THREE.MeshBasicMaterial({
    color: 0xe10600,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  });
  trackLine = new THREE.Mesh(tubeGeometry, tubeMaterial);
  threeScene.add(trackLine);

  // 4. Moving Headlight Particles
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    // Initialize speeds and starting progress fraction
    carPositions.push(i / particleCount); 
    carSpeeds.push(0.001 + Math.random() * 0.0015);

    // Get 3D coordinate from path fraction
    const pt = trackSpline.getPointAt(carPositions[i]);
    positions[i * 3] = pt.x;
    positions[i * 3 + 1] = pt.y + 1; // Float slightly above track
    positions[i * 3 + 2] = pt.z;

    // Color particles: Red, Orange, and Neon highlights
    const isTailLight = Math.random() > 0.5;
    colors[i * 3] = isTailLight ? 1.0 : 0.0;     // R
    colors[i * 3 + 1] = isTailLight ? 0.16 : 0.88; // G
    colors[i * 3 + 2] = isTailLight ? 0.0 : 1.0;   // B
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Glowing circle particle texture using canvas
  const particleTexture = createGlowTexture();

  const particleMat = new THREE.PointsMaterial({
    size: 2.8,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  particleSystem = new THREE.Points(particleGeo, particleMat);
  threeScene.add(particleSystem);

  // Listeners
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('mousemove', onMouseMove);
}

// Canvas-drawn radial glow texture for particle points
function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 42, 42, 0.8)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 16, 16);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Track mouse position and update point light coordinates
let targetLightX = 0;
let targetLightZ = 0;

function onMouseMove(e) {
  // Map client mouse coordinate to 3D plane coordinates (-80 to 80 range)
  targetLightX = ((e.clientX / window.innerWidth) - 0.5) * 120;
  targetLightZ = ((e.clientY / window.innerHeight) - 0.5) * 80;
}

function onWindowResize() {
  if (!threeCamera || !threeRenderer) return;
  threeCamera.aspect = window.innerWidth / window.innerHeight;
  threeCamera.updateProjectionMatrix();
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
}

// Adjust colors of lights and wireframes when theme switches
function updateThreeColors(theme) {
  if (!threeScene || !trackLine || !gridFloor || !lightFollower) return;
  
  const isLight = theme === 'light';
  
  // Update fog
  threeScene.fog.color.setHex(isLight ? 0xeaeaea : 0x0a0a0a);
  
  // Track wireframe opacity/color adjustments
  trackLine.material.color.setHex(isLight ? 0x0a0a0a : 0xe10600);
  trackLine.material.opacity = isLight ? 0.15 : 0.25;

  // Grid color
  threeScene.remove(gridFloor);
  const gridHelper = new THREE.GridHelper(200, 40, isLight ? 0x000000 : 0xff2a2a, isLight ? 0xcccccc : 0x1c1c1c);
  gridHelper.position.y = -10;
  threeScene.add(gridHelper);
  gridFloor = gridHelper;

  // Spotlight color
  lightFollower.color.setHex(isLight ? 0xe10600 : 0xff2a2a);
}

// Main Frame Rendering Loop
function animateThreeJS() {
  requestAnimationFrame(animateThreeJS);

  if (!threeRenderer || !threeScene) return;

  // 1. Slowly rotate the entire grid and track loop for floating 3D parallax feel
  if (trackLine) trackLine.rotation.y += 0.0003;
  if (gridFloor) gridFloor.rotation.y += 0.0003;
  if (particleSystem) particleSystem.rotation.y += 0.0003;

  // 2. Smoothly ease point light to mouse coordinates (spring/lerp)
  if (lightFollower) {
    lightFollower.position.x += (targetLightX - lightFollower.position.x) * 0.05;
    // Hover slightly above the floor
    lightFollower.position.z += (targetLightZ - lightFollower.position.z) * 0.05;
  }

  // 3. Move headlight particles along the curve path loop
  if (particleSystem && trackSpline) {
    const positions = particleSystem.geometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
      // Advance position progress
      carPositions[i] = (carPositions[i] + carSpeeds[i]) % 1.0;
      
      const pt = trackSpline.getPointAt(carPositions[i]);
      
      // Update geometry positions buffer
      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y + 1;
      positions[i * 3 + 2] = pt.z;
    }
    
    // Tell renderer to redraw updated particle vertices
    particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  threeRenderer.render(threeScene, threeCamera);
}
