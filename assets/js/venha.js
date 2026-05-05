/* =============================================
   ASNOBET — venha.js
   Landing page interactions
   ============================================= */

// ── Scroll reveal ──
const revealObserver = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  
  // ── Live player counter ──
  const playerCountEl = document.getElementById('playerCount');
  let playerBase = 4831;
  
  setInterval(() => {
    playerBase = Math.max(4600, Math.min(5200, playerBase + Math.floor(Math.random() * 7) - 2));
    playerCountEl.textContent = playerBase.toLocaleString('pt-BR');
  }, 2800);
  
  // ── Animated multiplier ──
  const multEl = document.getElementById('multNumber');
  let mult = 1.0;
  let growing = true;
  
  setInterval(() => {
    if (growing) {
      mult += Math.random() * 2 + 0.5;
      if (mult > 80) growing = false;
    } else {
      mult = 1.0;
      growing = true;
    }
    multEl.innerHTML = mult.toFixed(1) + '<sup>×</sup>';
  }, 400);
  