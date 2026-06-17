/*
  Go-Kart Racing Track - AJAX Router & Page Interactions
  Creates smooth transitions between pages. Intercepts standard anchor clicks,
  swaps container contents, and binds interactive scripts dynamically.
*/

document.addEventListener('DOMContentLoaded', () => {
  initAJAXRouter();
  initPageSpecificBindings();
});

function initAJAXRouter() {
  // Create transition overlay elements if they don't exist
  let overlay = document.getElementById('transition-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'transition-overlay';
    overlay.innerHTML = `<div id="transition-overlay-content">Calibrating Telemetry...</div>`;
    document.body.appendChild(overlay);
  }

  // Intercept anchor tags
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    
    const href = anchor.getAttribute('href');
    if (!href) return;
    
    // Skip if external, hash, mailto, target blank, or non-html links
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || anchor.target === '_blank') {
      return;
    }
    
    e.preventDefault();
    navigateToPage(href);
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    loadPageContent(window.location.pathname.split('/').pop() || 'index.html', false);
  });
}

// Fun motorsport loading messages
const loadingMessages = [
  "PRE-HEATING RACING SLICKS...",
  "CHARGING NITRO SYSTEM...",
  "CALIBRATING THROTTLE SENSORS...",
  "OPTIMIZING RACING LINE TRAJECTORY...",
  "SYNCHRONIZING ECU ENGINE DYNAMICS...",
  "INITIALIZING SAFETY TELEMETRY SYSTEM...",
  "ENGAGING G-FORCE SENSORS...",
  "WARMING UP 400CC RACING ENGINES...",
];

function navigateToPage(url) {
  loadPageContent(url, true);
}

function loadPageContent(url, pushState = true) {
  const overlay = document.getElementById('transition-overlay');
  const overlayContent = document.getElementById('transition-overlay-content');
  const appContainer = document.getElementById('app-container');

  if (!overlay || !overlayContent || !appContainer) {
    window.location.href = url;
    return;
  }

  // Choose a random message
  const msg = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  overlayContent.innerText = msg;

  // 1. Play Exit Transition
  const tl = gsap.timeline({
    onComplete: () => {
      fetchPage(url, pushState);
    }
  });

  tl.set(overlay, { transformOrigin: "bottom", scaleY: 0 });
  tl.to(overlay, { scaleY: 1, duration: 0.5, ease: "power3.inOut" });
  tl.to(overlayContent, { opacity: 1, duration: 0.25 });
  tl.to(appContainer, { opacity: 0, filter: "blur(10px)", scale: 0.98, duration: 0.3 }, "-=0.3");
}

function fetchPage(url, pushState) {
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Page not found");
      return response.text();
    })
    .then(html => {
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');

      // Update Page Title
      document.title = newDoc.title;

      // Update Content
      const appContainer = document.getElementById('app-container');
      const newAppContainer = newDoc.getElementById('app-container');
      if (appContainer && newAppContainer) {
        appContainer.innerHTML = newAppContainer.innerHTML;
      }

      // Hide/Show Navbar and Footer dynamically (Login/Register don't have them)
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const hasNavbar = newDoc.querySelector('header') !== null;
      const hasFooter = newDoc.querySelector('footer') !== null;
      
      if (header) header.style.display = hasNavbar ? '' : 'none';
      if (footer) footer.style.display = hasFooter ? '' : 'none';

      // Push history state if requested
      if (pushState) {
        history.pushState(null, '', url);
      }

      // Scroll to top
      if (typeof Lenis !== 'undefined' && window.lenisInstance) {
        window.lenisInstance.resize();
        window.lenisInstance.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }

      // Re-trigger bindings
      if (window.updateActiveNavLink) window.updateActiveNavLink();
      if (window.initTelemetry) window.initTelemetry();
      if (window.updateCursorHovers) window.updateCursorHovers();
      
      initPageSpecificBindings();

      // 2. Play Entry Transition
      const overlay = document.getElementById('transition-overlay');
      const overlayContent = document.getElementById('transition-overlay-content');
      
      const tl = gsap.timeline();
      tl.to(overlayContent, { opacity: 0, duration: 0.2 });
      tl.to(overlay, { scaleY: 0, transformOrigin: "top", duration: 0.5, ease: "power3.inOut" });
      tl.to(appContainer, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.4 }, "-=0.3");
    })
    .catch(error => {
      console.error("AJAX navigation error:", error);
      window.location.href = url;
    });
}

// Consolidates page-specific interactive scripts
function initPageSpecificBindings() {
  // 1. Home 1 F1 starting lights
  const bulbs = document.querySelectorAll('#starting-lights .light-bulb');
  if (bulbs.length > 0) {
    initF1Lights();
  }

  // 2. Safety Waiver Page (Digital signature canvas & Submit)
  const canvas = document.querySelector('.sig-canvas');
  if (canvas) {
    initSignaturePad(canvas);
  }
  const waiverForm = document.getElementById('waiver-form');
  if (waiverForm) {
    initWaiverFormSubmit(waiverForm, canvas);
  }

  // 3. Book Race Page (Booking steps & custom selects)
  const bookingWizard = document.querySelector('.booking-wizard');
  if (bookingWizard) {
    initBookingWizard();
  }

  // 4. Contact Us Page Submit
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    initContactFormSubmit(contactForm);
  }

  // 5. Register Page Wizard Onboarding
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    initRegisterWizard();
  }

  // 6. Login/Register Password toggles
  const pwdToggle = document.querySelector('.password-toggle-btn');
  if (pwdToggle) {
    initPasswordToggle(pwdToggle);
  }
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    initLoginFormSubmit(loginForm);
  }
}

/* INTERACTION BINDINGS IMPLEMENTATIONS */

// F1 starting lights animation
function initF1Lights() {
  const bulbs = document.querySelectorAll('#starting-lights .light-bulb');
  if (bulbs.length === 0) return;
  
  bulbs.forEach(b => b.className = 'light-bulb');
  
  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline();
    bulbs.forEach((bulb, index) => {
      tl.to(bulb, {
        onStart: () => bulb.classList.add('red'),
        duration: 0.1
      }, `+=${0.6}`);
    });
    tl.to(bulbs, {
      onStart: () => {
        bulbs.forEach(b => {
          b.classList.remove('red');
          b.classList.add('green');
        });
      },
      duration: 0.2
    }, `+=${0.8}`);
    tl.to(bulbs, {
      opacity: 0.2,
      duration: 1,
      ease: "power2.out"
    }, "+=1.5");
  }
}

// Digital Signature Pad Canvas
function initSignaturePad(canvas) {
  const ctx = canvas.getContext('2d');
  let drawing = false;

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.strokeStyle = "#FF2A2A";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const startDraw = (e) => {
    drawing = true;
    draw(e);
  };
  const endDraw = () => {
    drawing = false;
    ctx.beginPath();
  };
  const draw = (e) => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mousemove', draw);
  
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(e); });
  canvas.addEventListener('touchend', endDraw);
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });

  const clearBtn = document.getElementById('clear-signature-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }
}

// Waiver form submit checking
function initWaiverFormSubmit(form, canvas) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (canvas) {
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() === blank.toDataURL()) {
        alert("Digital signature is required to authorize the safety waiver.");
        return;
      }
    }
    alert("Safety waiver submitted and synchronized successfully!");
    navigateToPage("index.html");
  });
}

// Booking Page flow
function initBookingWizard() {
  const steps = document.querySelectorAll('.booking-step-content');
  const progressSteps = document.querySelectorAll('.progress-step');
  const progressPercent = document.querySelector('.progress-step-bar');
  const nextBtns = document.querySelectorAll('.btn-next-step');
  const prevBtns = document.querySelectorAll('.btn-prev-step');
  let currentStepIndex = 0;

  const updateWizard = () => {
    steps.forEach((step, idx) => {
      step.classList.toggle('active', idx === currentStepIndex);
    });
    progressSteps.forEach((step, idx) => {
      step.classList.toggle('active', idx === currentStepIndex);
      step.classList.toggle('completed', idx < currentStepIndex);
    });
    const percent = (currentStepIndex / (steps.length - 1)) * 100;
    if (progressPercent) progressPercent.style.width = percent + '%';
  };

  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        updateWizard();
      }
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStepIndex > 0) {
        currentStepIndex--;
        updateWizard();
      }
    });
  });

  // Selector choices click events
  const selectBoxes = document.querySelectorAll('.select-box');
  selectBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const isAddon = box.id.startsWith('addon');
      if (!isAddon) {
        const parent = box.parentElement;
        parent.querySelectorAll('.select-box').forEach(el => el.classList.remove('selected'));
      }
      box.classList.toggle('selected');
    });
  });

  const timeBtns = document.querySelectorAll('.time-btn');
  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.parentElement.querySelectorAll('.time-btn').forEach(el => el.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
}

// Contact form submit checking
function initContactFormSubmit(form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Transmission sent successfully! Our pit crew will respond in 24 hours.");
    form.reset();
  });
}

// Register Onboarding Wizard
function initRegisterWizard() {
  const steps = document.querySelectorAll('.register-wizard-step');
  const dots = document.querySelectorAll('.onboard-dot');
  const nextBtns = document.querySelectorAll('.btn-reg-next');
  const prevBtns = document.querySelectorAll('.btn-reg-prev');
  const form = document.getElementById('register-form');
  let stepIndex = 0;

  const updateRegWizard = () => {
    steps.forEach((step, idx) => {
      step.classList.toggle('active', idx === stepIndex);
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === stepIndex);
      dot.style.background = idx === stepIndex ? 'var(--color-glow)' : 'var(--color-accent)';
    });
  };

  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (stepIndex === 0) {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pwd = document.getElementById('reg-pwd').value;
        if (!name || !email || !pwd) {
          alert("All profile details are required before continuing.");
          return;
        }
      }
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        updateRegWizard();
      }
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (stepIndex > 0) {
        stepIndex--;
        updateRegWizard();
      }
    });
  });

  const classCards = document.querySelectorAll('.class-select-card');
  classCards.forEach(card => {
    card.addEventListener('click', () => {
      classCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  const avatarItems = document.querySelectorAll('.avatar-item');
  avatarItems.forEach(item => {
    item.addEventListener('click', () => {
      avatarItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Profile registered! Your racing dashboard is now active.");
    navigateToPage("index.html");
  });
}

// Password visibility eye icon switcher
function initPasswordToggle(btn) {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    if (input) {
      const isPwd = input.type === 'password';
      input.type = isPwd ? 'text' : 'password';
      const eyeOpen = btn.querySelector('.eye-open');
      const eyeClosed = btn.querySelector('.eye-closed');
      if (eyeOpen && eyeClosed) {
        eyeOpen.style.display = isPwd ? 'none' : 'block';
        eyeClosed.style.display = isPwd ? 'block' : 'none';
      }
    }
  });
}

// Login form submit checking
function initLoginFormSubmit(form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Security profile authorized! Entering grid lobbies.");
    navigateToPage("index.html");
  });
}
