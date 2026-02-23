// ===== INIT AOS =====
AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic', offset: 60 });

// ===== CONFIGURATION =====
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztNVNgRJCDUD5Jq8_pT0WKIkAYdCZ2VIIxrI50JSY_FsKGSe9Kllyrpp0h7b4y6CE2kw/exec';
window.addEventListener('load', () => {
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
  }, 1200);
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Sticky navbar
  if (navbar) {
    navbar.classList.toggle('scrolled', scrollY > 60);
  }

  // Scroll to top button
  if (scrollTopBtn) {
    scrollTopBtn.classList.toggle('visible', scrollY > 400);
  }

  // Active nav link highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  let current = '';
  sections.forEach(section => {
    if (scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });

  mobileNavItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === '#' + current) {
      item.classList.add('active');
    }
  });
});

// ===== MOBILE NAV TOGGLE =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    if (navMenu.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close menu on link click
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.querySelectorAll('span').forEach(s => {
        s.style.transform = ''; s.style.opacity = '';
      });
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target) && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      navToggle.querySelectorAll('span').forEach(s => {
        s.style.transform = ''; s.style.opacity = '';
      });
    }
  });
}

// ===== SCROLL TO TOP =====
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  });
});

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, duration) {
  const start = performance.now();
  const startVal = 0;
  const update = (currentTime) => {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * (target - startVal) + startVal).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('.stat-number');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        animateCounter(counter, target, 2000);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) statsObserver.observe(statsSection);

// ===== CONTACT FORM SUBMISSION =====
const contactForm = document.getElementById('contactForm');
const toast = document.getElementById('toast');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Basic validation
    const name = document.getElementById('fname').value.trim();
    const phone = document.getElementById('fphone').value.trim();

    if (!name || !phone) {
      showToast('Please fill in your name and phone number.', 'error');
      return;
    }

    // Send to Google Sheets
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    const formData = new FormData();
    formData.append('Name', name);
    formData.append('Phone', phone);
    formData.append('Condition/Service', document.getElementById('fservice').value);
    formData.append('Message / Symptoms', document.getElementById('fmessage').value);

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors' // Google Script returns CORS error but still works with 'no-cors'
    })
      .then(() => {
        showToast('✓ Appointment request sent! We will contact you soon.', 'success');
        contactForm.reset();
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Request Sent!';
        submitBtn.style.background = 'linear-gradient(135deg,#10b981,#059669)';

        setTimeout(() => {
          submitBtn.innerHTML = originalContent;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 3000);
      })
      .catch(error => {
        console.error('Error!', error.message);
        showToast('Something went wrong. Please try again.', 'error');
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
      });
  });
}

function showToast(message, type) {
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===== BOOKING BOTTOM SHEET LOGIC =====
const bookingSheet = document.getElementById('bookingSheet');
const bookingBackdrop = document.getElementById('bookingBackdrop');
const closeSheet = document.getElementById('closeSheet');
const mobileBookingForm = document.getElementById('mobileBookingForm');

function openBookingSheet() {
  if (window.innerWidth <= 700) {
    bookingSheet.classList.add('active');
    bookingBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scroll
  }
}

function closeBookingSheet() {
  bookingSheet.classList.remove('active');
  bookingBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

// Trigger sheet for all "Book Appointment" links on mobile
document.querySelectorAll('a[href="#contact"]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (window.innerWidth <= 700) {
      e.preventDefault();
      openBookingSheet();
    }
  });
});

if (closeSheet) closeSheet.addEventListener('click', closeBookingSheet);
if (bookingBackdrop) bookingBackdrop.addEventListener('click', closeBookingSheet);

// Mobile Form Submission
if (mobileBookingForm) {
  mobileBookingForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('ms_name').value.trim();
    const phone = document.getElementById('ms_phone').value.trim();

    if (!name || !phone) {
      showToast('Please fill in your name and phone number.', 'error');
      return;
    }

    // Send to Google Sheets
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    const formData = new FormData();
    formData.append('Name', name);
    formData.append('Phone', phone);
    formData.append('Condition/Service', document.getElementById('ms_service').value);
    formData.append('Message / Symptoms', document.getElementById('ms_message').value);

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    })
      .then(() => {
        showToast('✓ Appointment request sent!', 'success');
        mobileBookingForm.reset();
        closeBookingSheet();
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
      })
      .catch(error => {
        console.error('Error!', error.message);
        showToast('Error. Please try again.', 'error');
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
      });
  });
}

// ===== SERVICE CARD RIPPLE EFFECT =====
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', x + 'px');
    card.style.setProperty('--mouse-y', y + 'px');
  });
});

// ===== MOBILE NAV CLICK FEEDBACK =====
document.querySelectorAll('.mobile-nav-item').forEach(item => {
  item.addEventListener('click', function () {
    this.style.transform = 'scale(0.9)';
    setTimeout(() => {
      this.style.transform = '';
    }, 150);
  });
});

// ===== HERO PARTICLES BACKGROUND (Pure CSS-like dots via canvas) =====
const canvas = document.getElementById('particles');
if (canvas) {
  const canvasEl = document.createElement('canvas');
  canvasEl.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  canvas.appendChild(canvasEl);

  const ctx = canvasEl.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvasEl.width = canvas.offsetWidth;
    H = canvasEl.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.floor((W * H) / 10000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.4 + 0.1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56,189,248,${p.alpha})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
}

// ===== EXPERTISE TAGS STAGGER ANIMATION =====
const expertiseTags = document.querySelectorAll('.expertise-tags span');
expertiseTags.forEach((tag, i) => {
  tag.style.transitionDelay = (i * 0.03) + 's';
});

console.log('%cDr. Meghraj Singh Patel — Neurology Website', 'color:#0ea5e9;font-weight:bold;font-size:16px;');
