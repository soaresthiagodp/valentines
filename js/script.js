/**
 * Valentine's Day — script.js
 * Funcionalidades: Corações canvas, player de música, contador de amor,
 * scroll fade-in, lightbox carrossel, envelope carta, botão surpresa,
 * botão "Não" fujão, confetti canvas.
 */

"use strict";

/* ================================================
   CONFIGURAÇÕES — edite aqui conforme necessário
   ================================================ */

// Data de início do relacionamento (ano, mês-1, dia, hora, minuto, segundo)
const RELATIONSHIP_START = new Date(2026, 0, 1, 0, 0, 0); // 1º de janeiro de 2026 — o recomeço

// Imagens da galeria (caminhos relativos)
const GALLERY_IMAGES = [
  "images/gallery1.jpeg",
  "images/gallery2.jpeg",
  "images/gallery3.jpeg",
  "images/gallery4.jpeg",
  "images/gallery5.jpeg",
  "images/gallery6.jpeg",
];

/* ================================================
   FLOATING HEARTS CANVAS
   ================================================ */
(function initHearts() {
  const canvas = document.getElementById("hearts-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H;
  const hearts = [];
  const COUNT = 22;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  function Heart() {
    this.reset();
  }

  Heart.prototype.reset = function () {
    this.x    = Math.random() * W;
    this.y    = H + 30 + Math.random() * 60;
    this.size = 8 + Math.random() * 16;
    this.speed= 0.4 + Math.random() * 0.7;
    this.drift= (Math.random() - 0.5) * 0.5;
    this.opacity = 0.08 + Math.random() * 0.14;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.02;
  };

  Heart.prototype.update = function () {
    this.y        -= this.speed;
    this.x        += this.drift;
    this.rotation += this.rotSpeed;
    if (this.y < -40) this.reset();
  };

  function drawHeart(ctx, x, y, size, rotation, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = "#c0435a";
    ctx.beginPath();
    const s = size * 0.55;
    ctx.moveTo(0, s * 0.4);
    ctx.bezierCurveTo(-s, -s * 0.3, -s * 2, s * 0.5, 0, s * 1.4);
    ctx.bezierCurveTo( s * 2, s * 0.5, s, -s * 0.3, 0, s * 0.4);
    ctx.fill();
    ctx.restore();
  }

  for (let i = 0; i < COUNT; i++) {
    const h = new Heart();
    h.y = Math.random() * H; // distribute on first render
    hearts.push(h);
  }

  let lastTime = 0;
  function animate(ts) {
    if (ts - lastTime < 33) { requestAnimationFrame(animate); return; } // ~30fps cap
    lastTime = ts;
    ctx.clearRect(0, 0, W, H);
    hearts.forEach(h => {
      h.update();
      drawHeart(ctx, h.x, h.y, h.size, h.rotation, h.opacity);
    });
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

/* ================================================
   MUSIC PLAYER
   ================================================ */
(function initMusic() {
  const btn    = document.getElementById("musicBtn");
  const audio  = document.getElementById("bgAudio");
  const wave   = document.getElementById("musicWave");
  const playIc = btn.querySelector(".play-icon");
  const pausIc = btn.querySelector(".pause-icon");

  if (!btn || !audio) return;

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(() => {
        playIc.classList.add("hidden");
        pausIc.classList.remove("hidden");
        wave.classList.add("active");
      }).catch(() => {
        // autoplay blocked — not much we can do
      });
    } else {
      audio.pause();
      playIc.classList.remove("hidden");
      pausIc.classList.add("hidden");
      wave.classList.remove("active");
    }
  });
})();

/* ================================================
   LOVE COUNTER
   ================================================ */
(function initCounter() {
  const ids = {
    years:   document.getElementById("cnt-years"),
    months:  document.getElementById("cnt-months"),
    days:    document.getElementById("cnt-days"),
    hours:   document.getElementById("cnt-hours"),
    minutes: document.getElementById("cnt-minutes"),
    seconds: document.getElementById("cnt-seconds"),
  };

  if (!ids.seconds) return;

  function calcDiff(start, now) {
    let years  = now.getFullYear()  - start.getFullYear();
    let months = now.getMonth()     - start.getMonth();
    let days   = now.getDate()      - start.getDate();
    let hours  = now.getHours()     - start.getHours();
    let mins   = now.getMinutes()   - start.getMinutes();
    let secs   = now.getSeconds()   - start.getSeconds();

    if (secs   < 0) { secs   += 60; mins--;  }
    if (mins   < 0) { mins   += 60; hours--; }
    if (hours  < 0) { hours  += 24; days--;  }
    if (days   < 0) {
      // borrow from previous month
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0) { months += 12; years--; }

    return { years, months, days, hours, minutes: mins, seconds: secs };
  }

  function updateEl(el, val) {
    const str = String(val).padStart(2, "0");
    if (el.textContent !== str) {
      el.textContent = str;
      el.classList.remove("bump");
      void el.offsetWidth; // reflow
      el.classList.add("bump");
      setTimeout(() => el.classList.remove("bump"), 250);
    }
  }

  function tick() {
    const diff = calcDiff(RELATIONSHIP_START, new Date());
    updateEl(ids.years,   diff.years);
    updateEl(ids.months,  diff.months);
    updateEl(ids.days,    diff.days);
    updateEl(ids.hours,   diff.hours);
    updateEl(ids.minutes, diff.minutes);
    updateEl(ids.seconds, diff.seconds);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ================================================
   SCROLL FADE-IN (IntersectionObserver)
   ================================================ */
(function initFadeIn() {
  const els = document.querySelectorAll(".fade-in-element");
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
})();

/* ================================================
   GALLERY LIGHTBOX
   ================================================ */
(function initGallery() {
  const items    = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lbImg    = document.getElementById("lbImage");
  const lbClose  = document.getElementById("lbClose");
  const lbPrev   = document.getElementById("lbPrev");
  const lbNext   = document.getElementById("lbNext");
  const lbCnt    = document.getElementById("lbCounter");

  if (!lightbox || !items.length) return;

  let current = 0;
  const total = GALLERY_IMAGES.length;

  function setImage(index, direction = 0) {
    current = (index + total) % total;
    lbImg.style.opacity = "0";
    setTimeout(() => {
      lbImg.src = GALLERY_IMAGES[current];
      lbImg.alt = `Foto ${current + 1}`;
      lbCnt.textContent = `${current + 1} / ${total}`;
      lbImg.style.opacity = "1";
    }, 200);
  }

  function open(index) {
    setImage(index);
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function close() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  items.forEach(item => {
    item.addEventListener("click", () => open(parseInt(item.dataset.index, 10)));
  });

  lbClose.addEventListener("click", close);
  lbPrev.addEventListener("click",  () => setImage(current - 1));
  lbNext.addEventListener("click",  () => setImage(current + 1));

  lightbox.addEventListener("click", e => {
    if (e.target === lightbox) close();
  });

  // Keyboard navigation
  document.addEventListener("keydown", e => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape")      close();
    if (e.key === "ArrowLeft")   setImage(current - 1);
    if (e.key === "ArrowRight")  setImage(current + 1);
  });

  // Touch/swipe support
  let touchStartX = 0;
  lightbox.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? setImage(current + 1) : setImage(current - 1);
    }
  });
})();

/* ================================================
   ENVELOPE / LOVE LETTER
   ================================================ */
(function initEnvelope() {
  const envelope = document.getElementById("envelope");
  const hint     = document.getElementById("envelopeHint");
  if (!envelope) return;

  envelope.addEventListener("click", () => {
    if (!envelope.classList.contains("open")) {
      envelope.classList.add("open");
      if (hint) {
        hint.style.opacity = "0";
        setTimeout(() => hint.remove(), 600);
      }
    }
  });
})();

/* ================================================
   VALENTINE BUTTONS (Sim / Não fujão)
   ================================================ */
(function initValentineButtons() {
  const btnYes  = document.getElementById("btnYes");
  const btnNo   = document.getElementById("btnNo");
  const message = document.getElementById("yesMessage");
  if (!btnYes || !btnNo) return;

  const wrap = btnNo.parentElement;

  // Position "Não" button randomly within parent bounds on hover / touch
  function runAway() {
    const wrapRect  = wrap.getBoundingClientRect();
    const btnW      = btnNo.offsetWidth;
    const btnH      = btnNo.offsetHeight;

    // Zona segura: começa 70px abaixo do topo (abaixo do Sim) até o fundo do container
    const SAFE_TOP  = 70;
    const maxLeft   = wrapRect.width  - btnW;
    const maxTop    = wrapRect.height - btnH;

    const newLeft = Math.random() * maxLeft;
    const newTop  = SAFE_TOP + Math.random() * Math.max(0, maxTop - SAFE_TOP);

    btnNo.style.left      = newLeft + "px";
    btnNo.style.top       = newTop  + "px";
    btnNo.style.transform = "none"; // anula o translateX inicial após primeiro escape
  }

  btnNo.addEventListener("mouseenter", runAway);
  btnNo.addEventListener("touchstart",  e => {
    e.preventDefault();
    runAway();
  }, { passive: false });

  // "Yes" triggers confetti + message
  btnYes.addEventListener("click", () => {
    message.classList.remove("hidden");
    btnYes.disabled = true;
    btnNo.style.display = "none";
    launchConfetti();
  });
})();

/* ================================================
   CONFETTI
   ================================================ */
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  canvas.style.display = "block";

  const ctx = canvas.getContext("2d");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = [
    "#e88fa0", "#c9a84c", "#8b1a2e", "#f4c2c2",
    "#e8d08a", "#fff0f3", "#5a0e1e", "#f7a8b8",
  ];

  const PIECES = 180;
  const particles = [];

  for (let i = 0; i < PIECES; i++) {
    particles.push({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height - canvas.height,
      w:     6 + Math.random() * 8,
      h:     10 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot:   Math.random() * 360,
      rotS:  (Math.random() - 0.5) * 6,
      vx:    (Math.random() - 0.5) * 3,
      vy:    2.5 + Math.random() * 3.5,
      alpha: 1,
      shape: Math.random() < 0.35 ? "heart" : "rect",
    });
  }

  let frame = 0;
  function drawHeart(ctx, x, y, size) {
    const s = size * 0.4;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.4);
    ctx.bezierCurveTo(x - s, y - s * 0.3, x - s * 2, y + s * 0.5, x, y + s * 1.4);
    ctx.bezierCurveTo(x + s * 2, y + s * 0.5, x + s, y - s * 0.3, x, y + s * 0.4);
    ctx.fill();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y   += p.vy;
      p.x   += p.vx;
      p.rot += p.rotS;
      if (frame > 120) p.alpha = Math.max(0, p.alpha - 0.008);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);

      if (p.shape === "heart") {
        drawHeart(ctx, 0, 0, p.w);
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    });

    frame++;
    const alive = particles.some(p => p.alpha > 0 && p.y < canvas.height + 40);
    if (alive) {
      requestAnimationFrame(animate);
    } else {
      canvas.style.display = "none";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(animate);
}

/* ================================================
   SMOOTH ANCHOR SCROLL (polyfill para Safari)
   ================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
