/*
  Go-Kart Racing Track - Main JS
  Handles: Custom Cursor Physics, Theme Toggle, RTL Mode, and Lenis Scroll
*/

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lenis Smooth Scroll
  initSmoothScroll();

  // Initialize Theme and RTL controls
  initGlobalControls();

  // Initialize Back to Top Button
  initBackToTopButton();
});

/* 1. LENIS SMOOTH SCROLLING */
function initSmoothScroll() {
  // Deactivated Lenis to restore native normal scrolling mode across all pages
  window.lenisInstance = null;
}

/* 2. CUSTOM CURSOR REMOVED */

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

  const updateActiveNavLink = () => {
    // Relying on CSS-based highlighting via body id and href attributes
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

/* 4. DYNAMIC BACK-TO-TOP BUTTON */
function initBackToTopButton() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.className = 'btn-control pulse-anim';
  btn.title = 'Back to Top';
  btn.style.position = 'fixed';
  btn.style.bottom = '30px';
  btn.style.zIndex = '999';
  btn.style.width = '50px';
  btn.style.height = '50px';
  btn.style.borderRadius = '50%';
  btn.style.opacity = '0';
  btn.style.pointerEvents = 'none';
  btn.style.transition = 'opacity 0.4s ease, transform 0.4s ease, background-color 0.2s, border-color 0.2s';
  btn.style.display = 'flex';
  btn.style.justifyContent = 'center';
  btn.style.alignItems = 'center';
  
  const updatePosition = () => {
    const isRTL = document.body.getAttribute('dir') === 'rtl';
    if (isRTL) {
      btn.style.left = '30px';
      btn.style.right = 'auto';
    } else {
      btn.style.right = '30px';
      btn.style.left = 'auto';
    }
  };
  updatePosition();
  
  window.addEventListener('dirchanged', updatePosition);

  btn.innerHTML = `
    <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;">
      <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
    </svg>
  `;
  document.body.appendChild(btn);

  const toggleVisibility = () => {
    const scrollY = window.lenisInstance ? window.lenisInstance.scroll : window.scrollY;
    if (scrollY > 300) {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.style.transform = 'scale(1)';
    } else {
      btn.style.opacity = '0';
      btn.style.pointerEvents = 'none';
      btn.style.transform = 'scale(0.8)';
    }
  };

  window.addEventListener('scroll', toggleVisibility);
  if (window.lenisInstance) {
    window.lenisInstance.on('scroll', toggleVisibility);
  }

  btn.addEventListener('click', () => {
    if (window.lenisInstance) {
      window.lenisInstance.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
