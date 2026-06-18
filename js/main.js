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
    let currentPath = window.location.pathname.split('/').pop() || 'index.html';
    // If the path is empty (root), treat it as index.html
    if (currentPath === '') currentPath = 'index.html';
    
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      if (linkHref && linkHref === currentPath) {
        link.classList.add('active');
        // If it's inside a dropdown menu, also add active to the parent toggle
        const parentDropdown = link.closest('.dropdown-menu');
        if (parentDropdown) {
          const toggleLink = parentDropdown.previousElementSibling;
          if (toggleLink) toggleLink.classList.add('active');
        }
      } else {
        link.classList.remove('active');
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

  // Mobile Nav Initialization
  const navbarContainer = document.querySelector('.navbar-container');
  if (navbarContainer) {
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'hamburger-btn btn-control';
    hamburgerBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>';
    
    const mobileWrapper = document.createElement('div');
    mobileWrapper.className = 'mobile-nav-wrapper';
    
    const nav = document.querySelector('nav');
    const navControls = document.querySelector('.nav-controls');
    
    if (nav && navControls) {
      mobileWrapper.appendChild(nav);
      mobileWrapper.appendChild(navControls);
      
      const logo = document.querySelector('.logo-container');
      if (logo && logo.nextSibling) {
        navbarContainer.insertBefore(mobileWrapper, logo.nextSibling);
      } else {
        navbarContainer.appendChild(mobileWrapper);
      }
    }
    navbarContainer.appendChild(hamburgerBtn);

    hamburgerBtn.addEventListener('click', () => {
      document.body.classList.toggle('mobile-menu-open');
      if (document.body.classList.contains('mobile-menu-open')) {
        hamburgerBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
      } else {
        hamburgerBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>';
      }
    });
    
    // Handle dropdown toggles on mobile
    const dropdownItems = mobileWrapper.querySelectorAll('.nav-link-item.dropdown');
    dropdownItems.forEach(item => {
      const toggleLink = item.querySelector('a');
      if (toggleLink) {
        toggleLink.addEventListener('click', (e) => {
          e.preventDefault(); // Prevent navigating or closing menu
          item.classList.toggle('open');
        });
      }
    });

    // Close menu when a standard link is clicked
    const navLinks = mobileWrapper.querySelectorAll('a:not(.dropdown > a)');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        document.body.classList.remove('mobile-menu-open');
        hamburgerBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>';
      });
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
