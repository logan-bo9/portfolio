/**
 * Logan Böttger - Cursor Reveal Canvas Script
 * Hero Cursor-Reveal-Effekt mit 3D Isometric CAD-Würfeln (Schweif-Effekt in Vordergrund)
 */

(function () {
  'use strict';

  const heroSection = document.getElementById('hero');
  const canvas = document.getElementById('hero-canvas');
  if (!heroSection || !canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let mouseX = -1000;
  let mouseY = -1000;
  let isMouseInHero = false;

  const revealRadius = 60;        // Radius um den Zeiger/Maus (60px)
  const cubeSize = 22;            // Größe der isometrischen Würfel
  const sustainDurationMs = 300;  // Würfel bleiben min. 0,3 Sekunden nach Bewegung stehen (Schweif-Effekt)
  let cubes = [];

  // Farbpalette für 3D isometric Shading (Top, Left, Right Flächen)
  const bluePalettes = [
    { top: '#3352ff', left: '#0023ff', right: '#0018bd' },
    { top: '#4d68ff', left: '#001cd4', right: '#001299' },
    { top: '#1a3dff', left: '#0020eb', right: '#0015a8' },
    { top: '#6680ff', left: '#1a3dff', right: '#0018bd' },
    { top: '#0023ff', left: '#0018bd', right: '#000f7a' }
  ];

  function resizeCanvas() {
    const rect = heroSection.getBoundingClientRect();
    width = rect.width || window.innerWidth;
    height = rect.height || window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    initCubes();
  }

  function initCubes() {
    cubes = [];

    const isoW = cubeSize * Math.sqrt(3);
    const isoH = cubeSize;
    const colStep = isoW;
    const rowStep = isoH * 0.75;

    const cols = Math.ceil(width / colStep) + 3;
    const rows = Math.ceil(height / rowStep) + 3;

    for (let r = -1; r < rows; r++) {
      for (let c = -1; c < cols; c++) {
        // Versetzte Isometrie-Reihen
        const xOffset = (r % 2 === 0) ? 0 : colStep * 0.5;
        const x = c * colStep + xOffset;
        const y = r * rowStep;

        // Farbpalette festlegen
        const palette = bluePalettes[(Math.abs(r * 3 + c * 7)) % bluePalettes.length];

        cubes.push({
          x: x,
          y: y,
          cx: x,
          cy: y + cubeSize * 0.5,
          palette: palette,
          alpha: 0,
          lastActiveTime: 0
        });
      }
    }
  }

  // Zeichne einen 3D Isometrischen Würfel
  function drawIsometricCube(x, y, size, palette, alpha) {
    if (alpha <= 0.001) return;

    ctx.save();
    ctx.globalAlpha = alpha;

    const h = size * 0.5;
    const w = size * Math.sqrt(3) * 0.5;

    // Top Face
    ctx.fillStyle = palette.top;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.5);
    ctx.lineTo(x + w, y - size * 0.25);
    ctx.lineTo(x, y);
    ctx.lineTo(x - w, y - size * 0.25);
    ctx.closePath();
    ctx.fill();

    // Left Face
    ctx.fillStyle = palette.left;
    ctx.beginPath();
    ctx.moveTo(x - w, y - size * 0.25);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x - w, y + h * 0.5);
    ctx.closePath();
    ctx.fill();

    // Right Face
    ctx.fillStyle = palette.right;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y - size * 0.25);
    ctx.lineTo(x + w, y + h * 0.5);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();

    // Feine CAD-Kantenlinien
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
  }

  function render() {
    // Transparenter Hintergrund, damit die Würfel über Text & Portrait schweben
    ctx.clearRect(0, 0, width, height);

    const now = Date.now();

    for (let i = 0; i < cubes.length; i++) {
      const cube = cubes[i];

      if (isMouseInHero) {
        const dx = cube.cx - mouseX;
        const dy = cube.cy - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < revealRadius) {
          const ratio = 1 - (dist / revealRadius);
          const targetIntensity = Math.max(0.35, Math.pow(ratio, 1.1) * 0.95);
          if (targetIntensity > cube.alpha) {
            cube.alpha = targetIntensity;
          }
          cube.lastActiveTime = now;
        }
      }

      // Schweif-Effekt: Würfel halten ihre Sichtbarkeit mindestens sustainDurationMs (0,3 sek)
      const timeSinceActive = now - cube.lastActiveTime;
      if (timeSinceActive > sustainDurationMs) {
        // Sanftes Ausblenden nach der Standzeit
        cube.alpha -= 0.025;
        if (cube.alpha < 0) cube.alpha = 0;
      }

      if (cube.alpha > 0.001) {
        drawIsometricCube(cube.x, cube.y, cubeSize, cube.palette, cube.alpha);
      }
    }

    // Subtile CAD-Fokussierungs-Aura um den Mauszeiger
    if (isMouseInHero && mouseX >= 0 && mouseY >= 0) {
      ctx.save();
      const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, revealRadius);
      gradient.addColorStop(0, 'rgba(0, 35, 255, 0.12)');
      gradient.addColorStop(0.7, 'rgba(0, 35, 255, 0.03)');
      gradient.addColorStop(1, 'rgba(0, 35, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, revealRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  function updatePointerPos(clientX, clientY) {
    const rect = heroSection.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      // Prüfen, ob der Zeiger über einem Button, Link oder interaktiven Element schwebt
      const targetElem = document.elementFromPoint(clientX, clientY);
      const isOverInteractiveElem = targetElem && targetElem.closest('a, button, .btn-primary, .btn-outline, .nav-link, .portrait-badge, [role="button"]') !== null;

      if (isOverInteractiveElem) {
        isMouseInHero = false; // Effekt bei Hover über Buttons/Links ausblenden
      } else {
        mouseX = x;
        mouseY = y;
        isMouseInHero = true;
      }
    } else {
      isMouseInHero = false;
    }
  }

  // Event Listener für Maus und Touch
  window.addEventListener('mousemove', function (e) {
    updatePointerPos(e.clientX, e.clientY);
  });

  window.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches.length > 0) {
      updatePointerPos(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchstart', function (e) {
    if (e.touches && e.touches.length > 0) {
      updatePointerPos(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  heroSection.addEventListener('mouseleave', function () {
    isMouseInHero = false;
  });

  window.addEventListener('blur', function () {
    isMouseInHero = false;
  });

  window.addEventListener('resize', resizeCanvas);

  // Initialisieren & Aufrufen
  resizeCanvas();
  render();

})();
