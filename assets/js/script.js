/**
 * Logan Böttger - Main Application JavaScript
 * GitHub Pages Statisches Script
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // 1. Intro Screen Manager
  const introScreen = document.getElementById('intro-screen');
  if (introScreen) {
    setTimeout(function () {
      introScreen.classList.add('hidden-intro');
      // Initialize text reveals after intro finishes
      setTimeout(initSpotifyTextReveal, 300);
    }, 1200);
  } else {
    initSpotifyTextReveal();
  }

  // 2. Navbar Scroll State & Active Section Link
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.main-section');

  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;

    // Header Shadow on Scroll
    if (scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active Section Tracking
    let currentSectionId = '';
    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - 180;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(function (link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSectionId) {
          link.classList.add('active');
        }
      });
    }
  });

  // 3. Spotify-Style Word-by-Word Scroll Reveal
  function initSpotifyTextReveal() {
    const spotifyElements = document.querySelectorAll('.spotify-reveal');

    spotifyElements.forEach(function (el) {
      if (el.dataset.splitDone) return;
      el.dataset.splitDone = 'true';

      const originalText = el.textContent.trim();
      const words = originalText.split(/\s+/);
      el.innerHTML = '';

      words.forEach(function (word, idx) {
        const span = document.createElement('span');
        span.className = 'spotify-word';
        span.textContent = word + ' ';
        span.style.transitionDelay = (idx * 45) + 'ms';
        el.appendChild(span);
      });
    });

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.15
    };

    const textObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const words = entry.target.querySelectorAll('.spotify-word');
          words.forEach(function (word) {
            word.classList.add('revealed');
          });
          textObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    spotifyElements.forEach(function (el) {
      textObserver.observe(el);
    });
  }

  // 4. Section Transitions (Scale & Fade on Scroll)
  function initSectionTransitions() {
    const sectionObserverOptions = {
      root: null,
      rootMargin: '-10% 0px -10% 0px',
      threshold: [0.1, 0.4]
    };

    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-active');
          entry.target.classList.remove('section-inactive');
        } else {
          // Keep hero always visible or soft inactive
          if (entry.target.id !== 'hero') {
            entry.target.classList.remove('section-active');
            entry.target.classList.add('section-inactive');
          }
        }
      });
    }, sectionObserverOptions);

    sections.forEach(function (section) {
      section.classList.add('main-section', 'section-active');
      sectionObserver.observe(section);
    });
  }

  initSectionTransitions();

  // 5. Hero Portrait Parallax Effect
  const portraitImg = document.getElementById('hero-portrait');
  if (portraitImg) {
    window.addEventListener('scroll', function () {
      const scrolled = window.pageYOffset;
      if (scrolled < window.innerHeight) {
        portraitImg.style.transform = 'translateY(' + (scrolled * 0.18) + 'px)';
      }
    });
  }

  // 6. Smooth Scroll for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 80;
        const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

});
