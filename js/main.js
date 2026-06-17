/*
  Go-Kart Racing Track - Main JS
  Handles: Custom Cursor Physics, Theme Toggle, RTL Mode, and Lenis Scroll
*/

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lenis Smooth Scroll
  initSmoothScroll();

  // Initialize Custom Go-Kart Cursor
  initGoKartCursor();

  // Initialize Theme and RTL controls
  initGlobalControls();
});

/* 1. LENIS SMOOTH SCROLLING */
let lenisInstance = null;
function initSmoothScroll() {
  // Load Lenis from window if available (loaded via CDN in HTML)
  if (typeof Lenis !== 'undefined') {
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Expose globally
    window.lenisInstance = lenisInstance;

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync GSAP ScrollTrigger if GSAP is loaded
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenisInstance.on('scroll', ScrollTrigger.update);
    }
  }
}

/* 2. CUSTOM GO-KART CURSOR */
function initGoKartCursor() {
  const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 768);
  
  if (isMobile) {
    // Re-enable default cursor style for mobile
    const styleElement = document.createElement('style');
    styleElement.innerHTML = '* { cursor: auto !important; } input, textarea, select { cursor: text !important; }';
    document.head.appendChild(styleElement);
    return;
  }

  // Create custom cursor element
  const cursor = document.createElement('div');
  cursor.id = 'go-kart-cursor';
  
  // Go-kart SVG design with front wheels separated so we can rotate them
  cursor.innerHTML = `
    <svg class="kart-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Shadow -->
      <ellipse cx="50" cy="55" rx="35" ry="20" fill="rgba(0,0,0,0.4)" />
      
      <!-- Exhaust Flame (Nitro) -->
      <polygon id="exhaust-flame" points="50,90 45,75 55,75" fill="#FF5E00" opacity="0" />
      <polygon id="exhaust-flame-inner" points="50,85 47,75 53,75" fill="#FFA500" opacity="0" />

      <!-- Rear Axle & Wheels -->
      <rect x="15" y="65" width="70" height="8" rx="2" fill="#222" />
      <rect id="wheel-rl" x="10" y="55" width="12" height="26" rx="4" fill="#000" stroke="#333" stroke-width="1" />
      <rect id="wheel-rr" x="78" y="55" width="12" height="26" rx="4" fill="#000" stroke="#333" stroke-width="1" />

      <!-- Chassis Front & Spoiler -->
      <path d="M30,70 L70,70 L65,40 L50,15 L35,40 Z" fill="#E10600" stroke="#9E0400" stroke-width="2" />
      <rect x="25" y="68" width="50" height="6" fill="#1A1A1A" />
      
      <!-- Driver Helmet (Racing Red / Black) -->
      <circle cx="50" cy="48" r="11" fill="#111" />
      <circle cx="50" cy="48" r="9" fill="#E10600" />
      <!-- Visor -->
      <path d="M42,43 C42,43 45,39 50,39 C55,39 58,43 58,43 C58,43 55,47 50,47 C45,47 42,43 42,43 Z" fill="#fff" />
      
      <!-- Front Axle & Wheels (Steerable) -->
      <g id="front-left-wheel-group" transform="translate(22, 32)">
        <rect id="wheel-fl" x="-6" y="-10" width="12" height="20" rx="3" fill="#000" stroke="#333" stroke-width="1" />
      </g>
      <g id="front-right-wheel-group" transform="translate(78, 32)">
        <rect id="wheel-fr" x="-6" y="-10" width="12" height="20" rx="3" fill="#000" stroke="#333" stroke-width="1" />
      </g>

      <!-- Sidepods -->
      <path d="M22,70 L25,48 L35,42 L33,70 Z" fill="#1A1A1A" />
      <path d="M78,70 L75,48 L65,42 L67,70 Z" fill="#1A1A1A" />
      
      <!-- Front Wing / Nose -->
      <path d="M35,22 L65,22 L50,8 Z" fill="#E10600" />
      <rect x="28" y="18" width="44" height="4" fill="#1A1A1A" rx="1" />
    </svg>
  `;

  document.body.appendChild(cursor);

  // Position and Physics Variables
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let kartX = mouseX;
  let kartY = mouseY;
  let angle = 0;
  
  // Interpolation speed (higher = faster response)
  const lerpFactor = 0.15;
  let lastX = mouseX;
  let lastY = mouseY;
  let velocity = 0;

  // Track Mouse Movement
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Track hover elements (links, buttons, interactive cards)
  let isHovering = false;
  const updateHovers = () => {
    const interactives = document.querySelectorAll('a, button, input, textarea, select, .glass-card, .btn-control, [data-hover-accelerate]');
    interactives.forEach(el => {
      // Avoid duplicate attachments
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = "true";

      el.addEventListener('mouseenter', () => {
        isHovering = true;
        cursor.classList.add('hover-accelerate');
        // Make wheels look like they spin fast by updating front wheels
        gsap.to('#front-left-wheel-group, #front-right-wheel-group', { scaleY: 1.1, duration: 0.2 });
        gsap.to(cursor, { scale: 1.25, filter: 'drop-shadow(0 0 15px rgba(255,42,42,0.8))', duration: 0.2 });
      });

      el.addEventListener('mouseleave', () => {
        isHovering = false;
        cursor.classList.remove('hover-accelerate');
        gsap.to('#front-left-wheel-group, #front-right-wheel-group', { scaleY: 1, duration: 0.2 });
        gsap.to(cursor, { scale: 1, filter: 'none', duration: 0.2 });
      });
    });
  };

  updateHovers();
  
  // Hook updateHovers on page mutation to support AJAX page updates
  const observer = new MutationObserver(updateHovers);
  observer.observe(document.body, { childList: true, subtree: true });

  // Expose hover trigger to other modules
  window.updateCursorHovers = updateHovers;

  // Main Cursor Animation Loop
  function updateCursor() {
    // Lerp coordinates
    const dx = mouseX - kartX;
    const dy = mouseY - kartY;
    
    kartX += dx * lerpFactor;
    kartY += dy * lerpFactor;
    
    // Calculate Velocity and movement vector
    const moveX = kartX - lastX;
    const moveY = kartY - lastY;
    velocity = Math.sqrt(moveX * moveX + moveY * moveY);
    
    // Calculate Target Angle based on movement direction
    let targetAngle = angle;
    if (velocity > 1) {
      // Point in direction of motion (SVG is vertical, so we add 90 deg)
      targetAngle = Math.atan2(moveY, moveX) * 180 / Math.PI + 90;
    }
    
    // Smooth angle rotation (handling 360 wrap around)
    let diff = targetAngle - angle;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;
    angle += diff * 0.2;

    // Calculate turning rate for front wheel steering angle
    let steeringAngle = diff * 2.5;
    // Cap steering rotation to realistic 30 degrees
    steeringAngle = Math.max(-30, Math.min(30, steeringAngle));
    
    // Apply transformations
    cursor.style.transform = `translate3d(${kartX}px, ${kartY}px, 0) rotate(${angle}deg)`;
    
    // Rotate individual front wheels based on steer angle
    const wlGroup = document.getElementById('front-left-wheel-group');
    const wrGroup = document.getElementById('front-right-wheel-group');
    if (wlGroup && wrGroup) {
      wlGroup.style.transform = `translate(22px, 32px) rotate(${steeringAngle}deg)`;
      wrGroup.style.transform = `translate(78px, 32px) rotate(${steeringAngle}deg)`;
    }

    // Nitro flame & Glow effects during fast movements or hover
    const flame = document.getElementById('exhaust-flame');
    const flameInner = document.getElementById('exhaust-flame-inner');
    if (flame && flameInner) {
      if (velocity > 12 || isHovering) {
        flame.style.opacity = '0.9';
        flameInner.style.opacity = '1';
        // Random flame flicker
        const scale = 0.8 + Math.random() * 0.4;
        flame.style.transform = `scale(${scale})`;
      } else {
        flame.style.opacity = '0';
        flameInner.style.opacity = '0';
      }
    }

    // Spawn Smoke and Speed Trails
    if (velocity > 5) {
      // Spawn speed trail behind tires (rear tires are at rl and rr)
      if (Math.random() < 0.3) {
        spawnTrailParticle(kartX, kartY, angle);
      }
      
      // Spawn drift smoke when turning sharply (high diff/steering angle)
      if (Math.abs(steeringAngle) > 15 && velocity > 8) {
        spawnSmokeParticle(kartX, kartY, angle);
      }
    }

    lastX = kartX;
    lastY = kartY;
    
    requestAnimationFrame(updateCursor);
  }

  updateCursor();
}

// Helper to spawn red neon speed trail dots
function spawnTrailParticle(kx, ky, kartAngle) {
  const trail = document.createElement('div');
  trail.className = 'speed-trail';
  
  // Offset to spawn behind rear axle of kart
  // Kart is pointing at kartAngle. Axle is in back.
  const rad = (kartAngle - 90) * Math.PI / 180;
  const backOffset = 20; //px behind center
  
  const px = kx - Math.cos(rad) * backOffset + (Math.random() - 0.5) * 10;
  const py = ky - Math.sin(rad) * backOffset + (Math.random() - 0.5) * 10;

  trail.style.left = `${px}px`;
  trail.style.top = `${py}px`;

  document.body.appendChild(trail);

  // Animate out
  gsap.to(trail, {
    scale: 0.1,
    opacity: 0,
    duration: 0.4,
    onComplete: () => {
      trail.remove();
    }
  });
}

// Helper to spawn white tire/drift smoke
function spawnSmokeParticle(kx, ky, kartAngle) {
  const smoke = document.createElement('div');
  smoke.className = 'smoke-particle';
  
  const rad = (kartAngle - 90) * Math.PI / 180;
  const backOffset = 22; // rear wheels area
  
  // Left or right rear wheel drift offsets
  const sideOffset = Math.random() > 0.5 ? 12 : -12;
  const sideRad = (kartAngle) * Math.PI / 180;

  const px = kx - Math.cos(rad) * backOffset + Math.cos(sideRad) * sideOffset;
  const py = ky - Math.sin(rad) * backOffset + Math.sin(sideRad) * sideOffset;

  smoke.style.left = `${px}px`;
  smoke.style.top = `${py}px`;
  
  // Random size
  const size = 6 + Math.random() * 8;
  smoke.style.width = `${size}px`;
  smoke.style.height = `${size}px`;

  document.body.appendChild(smoke);

  // Drift drift and fade
  const driftAngle = Math.random() * Math.PI * 2;
  const driftDist = 10 + Math.random() * 20;
  
  gsap.to(smoke, {
    x: Math.cos(driftAngle) * driftDist,
    y: Math.sin(driftAngle) * driftDist,
    scale: 2.5,
    opacity: 0,
    duration: 0.6 + Math.random() * 0.4,
    onComplete: () => {
      smoke.remove();
    }
  });
}

/* 3. THEME TOGGLE, RTL AND NAVBAR EFFECTS */
function initGlobalControls() {
  // Sticky Navbar shrink detection
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('shrink');
      } else {
        header.classList.remove('shrink');
      }
    });
  }

  // Active link state listener
  const updateActiveNavLink = () => {
    const path = window.location.pathname;
    const page = path.split("/").pop() || 'index.html';
    
    document.querySelectorAll('.nav-link-item a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === page || (page === 'index.html' && href === './') || (page === '' && href === './')) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  };
  
  updateActiveNavLink();
  window.addEventListener('popstate', updateActiveNavLink);
  // Expose it for AJAX Router
  window.updateActiveNavLink = updateActiveNavLink;

  // Dark Mode Toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    // Check local storage
    if (localStorage.getItem('theme') === 'light') {
      document.body.classList.add('light-theme');
    }
    
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
      localStorage.setItem('theme', currentTheme);
      
      // Emit event for dynamic components (Three.js can adjust lights)
      window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: currentTheme } }));
    });
  }

  // RTL Toggle
  const rtlToggle = document.getElementById('rtl-toggle');
  if (rtlToggle) {
    // Check local storage
    if (localStorage.getItem('dir') === 'rtl') {
      document.body.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.lang = 'ar';
    }

    rtlToggle.addEventListener('click', () => {
      const isRTL = document.body.getAttribute('dir') === 'rtl';
      if (isRTL) {
        document.body.removeAttribute('dir');
        document.documentElement.removeAttribute('dir');
        document.body.lang = 'en';
        localStorage.setItem('dir', 'ltr');
      } else {
        document.body.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('dir', 'rtl');
        document.body.lang = 'ar';
        localStorage.setItem('dir', 'rtl');
      }
      
      // Dispatch event to redraw charts/telemetry if direction changes
      window.dispatchEvent(new CustomEvent('dirchanged', { detail: { dir: isRTL ? 'ltr' : 'rtl' } }));
    });
  }
}
