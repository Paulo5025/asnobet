/**
 * ui.js
 * Funções puras de manipulação do DOM reutilizadas por todos os módulos de jogo.
 * Nenhuma lógica de negócio aqui — apenas apresentação.
 */

const UI = (() => {
  // ── Toast ───────────────────────────────────────────────────────────────────
  let _toastTimer = null;

  /**
   * Exibe uma mensagem flutuante temporária.
   * @param {string} msg
   * @param {number} [duracao=2500]
   */
  function toast(msg, duracao = 2500) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el.classList.remove('show'), duracao);
  }

  // ── Resultado ───────────────────────────────────────────────────────────────

  /**
   * @param {string} id     ID do elemento .resultado
   * @param {string} msg
   * @param {'ganhou'|'perdeu'|'neutro'} tipo
   */
  function setResultado(id, msg, tipo) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className = `resultado ${tipo}`;
  }

  // ── Saldo display ────────────────────────────────────────────────────────────
  function renderSaldo(valor) {
    const el = document.getElementById('saldoDisplay');
    if (el) el.textContent = `R$ ${valor.toLocaleString('pt-BR')}`;
  }

  // ── Navegação ─────────────────────────────────────────────────────────────────

  /** Mapa lógico → ID do elemento HTML */
  const PAGE_MAP = {
    home:    'pageHome',
    jackpot: 'pageJackpot',
    roleta:  'pageRoleta',
    cartas:  'pageCartas',
    limit:   'pageLimit',
    rocket:  'pageRocket',
    craps:   'pageCraps',
  };

  /**
   * Ativa a página correspondente e oculta as demais.
   * @param {string} pagina
   */
  function mostrarPagina(pagina) {
    Object.values(PAGE_MAP).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });

    const alvo = PAGE_MAP[pagina] ?? PAGE_MAP['home'];
    const el = document.getElementById(alvo);
    if (el) el.classList.add('active');

    window.scrollTo(0, 0);
  }

  // ── Seletor de apostas ───────────────────────────────────────────────────────

  /**
   * Marca o botão ativo no grupo de aposta e atualiza o Store.
   * @param {HTMLElement} btn
   * @param {number}      valor
   */
  function selecionarAposta(btn, valor) {
    btn.closest('.bet-btns')
       .querySelectorAll('.bet-btn')
       .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    Store.setAposta(valor);
  }

  // ── Helpers gerais ───────────────────────────────────────────────────────────

  /**
   * Cria um elemento HTML com atributos e filhos opcionais.
   * @param {string} tag
   * @param {object} [attrs]
   * @param {...(Node|string)} children
   * @returns {HTMLElement}
   */
  function createElement(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'className') el.className = v;
      else if (k === 'dataset') Object.entries(v).forEach(([dk, dv]) => el.dataset[dk] = dv);
      else el[k] = v;
    });
    children.forEach(c => el.append(c));
    return el;
  }

  // ── Reação de resultado (bravo/rindo) ────────────────────────────────────────

  let _reacaoTimer = null;

  /**
   * Exibe imagem de reação ao resultado do jogo.
   * @param {'ganhou'|'perdeu'} tipo
   */
  const FRASES_GANHOU = [
    'Muito bem, infeliz! Pegue seu dinheiro! 🤑',
    'Uau... dessa vez você se safou. Aproveita! 💸',
    'Tá bom, levou. Mas vai devolver depois! 😤',
    'Sorte de novato! A casa sempre ganha no final. 😒',
    'Dessa vez foi você. Da próxima é meu! 😈',
  ];

  const FRASES_PERDEU = [
    'Parabéns Zé! Obrigado pela grana! 😂',
    'Boa tentativa, lendário perdedor! 🤣',
    'Obrigado pela doação! A casa agradece! 🏦',
    'Mais uma pro cassino! Você é nosso cliente favorito! 💰',
    'Tá pagando as nossas contas, obrigado! 😹',
  ];

  function _fraseAleatoria(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function mostrarReacao(tipo) {
    let overlay = document.getElementById('reacaoOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'reacaoOverlay';
      overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
        opacity: 0; transition: opacity 0.3s ease;
        pointer-events: none;
      `;

      const wrapper = document.createElement('div');
      wrapper.id = 'reacaoWrapper';
      wrapper.style.cssText = `
        display: flex; flex-direction: column; align-items: center; gap: 16px;
        transform: scale(0.7); transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
      `;

      const img = document.createElement('img');
      img.id = 'reacaoImg';
      img.style.cssText = `
        max-width: min(300px, 75vw); max-height: 55vh;
        border-radius: 20px; box-shadow: 0 8px 40px rgba(0,0,0,0.6);
      `;

      const frase = document.createElement('div');
      frase.id = 'reacaoFrase';
      frase.style.cssText = `
        font-family: var(--font-title, 'Georgia', serif);
        font-size: clamp(0.95rem, 3vw, 1.25rem);
        font-weight: 700;
        text-align: center;
        padding: 12px 20px;
        border-radius: 12px;
        max-width: min(340px, 85vw);
        line-height: 1.4;
        letter-spacing: 0.03em;
        text-shadow: 0 2px 6px rgba(0,0,0,0.5);
      `;

      wrapper.appendChild(img);
      wrapper.appendChild(frase);
      overlay.appendChild(wrapper);
      document.body.appendChild(overlay);
      overlay.addEventListener('click', () => _fecharReacao());
    }

    const img    = document.getElementById('reacaoImg');
    const frase  = document.getElementById('reacaoFrase');
    const wrapper = document.getElementById('reacaoWrapper');

    if (tipo === 'ganhou') {
      img.src = '../assets/img/bravo.png';
      frase.textContent = _fraseAleatoria(FRASES_GANHOU);
      frase.style.background = 'linear-gradient(135deg, #1a4a1a, #2d7a2d)';
      frase.style.color = '#b8ffb8';
      frase.style.border = '1px solid #4caf50';
    } else {
      img.src = '../assets/img/rindo.png';
      frase.textContent = _fraseAleatoria(FRASES_PERDEU);
      frase.style.background = 'linear-gradient(135deg, #4a1a1a, #7a2d2d)';
      frase.style.color = '#ffb8b8';
      frase.style.border = '1px solid #f44336';
    }

    overlay.style.pointerEvents = 'auto';
    wrapper.style.transform = 'scale(0.7)';

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      wrapper.style.transform = 'scale(1)';
    });

    clearTimeout(_reacaoTimer);
    _reacaoTimer = setTimeout(() => _fecharReacao(), 3000);
  }

  function _fecharReacao() {
    const overlay = document.getElementById('reacaoOverlay');
    const wrapper = document.getElementById('reacaoWrapper');
    if (!overlay) return;
    overlay.style.opacity = '0';
    if (wrapper) wrapper.style.transform = 'scale(0.7)';
    overlay.style.pointerEvents = 'none';
    clearTimeout(_reacaoTimer);
  }

  // ── Modal de guia/regras ──────────────────────────────────────────────────────

  const REGRAS = {
    jackpot: {
      titulo: '🎰 Jackpot — Regras',
      conteudo: `
        <p>Gire os três rolos e torça para que fiquem iguais!</p>
        <ul>
          <li>Escolha o valor da aposta (R$10, 25, 50 ou 100).</li>
          <li>Clique em <strong>GIRAR</strong> e aguarde os rolos pararem.</li>
          <li>Se os três símbolos forem iguais, você ganha!</li>
        </ul>
        <h4>Multiplicadores de prêmio:</h4>
        <ul>
          <li>🎰 <strong>7 7 7</strong> → 10× (Jackpot máximo!)</li>
          <li>💎 💎 💎 → 8×</li>
          <li>⭐ ⭐ ⭐ → 6×</li>
          <li>Qualquer outro trio → 3×</li>
        </ul>
      `
    },
    roleta: {
      titulo: '🎯 Color Spin — Regras',
      conteudo: `
        <p>Aposte em uma cor e veja onde a roleta para!</p>
        <ul>
          <li>Escolha o valor da aposta (R$10, 25 ou 50).</li>
          <li>Selecione uma cor: Vermelho, Azul ou Dourado.</li>
          <li>Ao clicar na cor, a roleta gira automaticamente.</li>
          <li>Se a cor central for a sua, você ganha!</li>
        </ul>
        <h4>Chances e multiplicadores:</h4>
        <ul>
          <li>🔴 <strong>Vermelho</strong> → 45% de chance · paga 2×</li>
          <li>🔵 <strong>Azul</strong> → 45% de chance · paga 2×</li>
          <li>🟡 <strong>Dourado</strong> → 10% de chance · paga 5×</li>
        </ul>
      `
    },
    cartas: {
      titulo: '🃏 Lucky Draw 10 — Regras',
      conteudo: `
        <p>Escolha uma carta e torça para ser sorteada!</p>
        <ul>
          <li>Há 10 cartas disponíveis no tabuleiro.</li>
          <li>Clique em uma carta para selecioná-la.</li>
          <li>Escolha o valor da aposta e clique em <strong>SACAR CARTA</strong>.</li>
          <li>Uma carta aleatória é sorteada entre as 10.</li>
          <li>Se for a sua carta, você ganha <strong>8× a aposta</strong>!</li>
        </ul>
        <p><em>Probabilidade de acerto: 1 em 10 (10%)</em></p>
      `
    },
    limit: {
      titulo: '📊 Limit Rush — Regras',
      conteudo: `
        <p>Adivinhe onde a barra de progresso vai parar!</p>
        <ul>
          <li>A barra para em um valor aleatório de 1% a 100%.</li>
          <li>Escolha um tipo de aposta antes de iniciar.</li>
        </ul>
        <h4>Tipos de aposta:</h4>
        <ul>
          <li>📉 <strong>Aposta Baixa</strong> — Escolha um intervalo de 25% · paga 2×</li>
          <li>🎯 <strong>Aposta Média</strong> — Acerte o número exato (1%, 50% ou 100%) · paga 20×</li>
          <li>🏆 <strong>Aposta Alta</strong> — Digite qualquer % com margem ±5% · paga 8×</li>
        </ul>
      `
    },
    rocket: {
      titulo: '🚀 Donkey Rocket — Regras',
      conteudo: `
        <p>O foguete sobe e o multiplicador cresce — mas vai explodir a qualquer momento!</p>
        <ul>
          <li>Escolha o valor da aposta (R$10, 25 ou 50).</li>
          <li>Clique em <strong>INICIAR</strong> para lançar o foguete.</li>
          <li>O multiplicador sobe continuamente a partir de 1×.</li>
          <li>Clique em <strong>SACAR</strong> antes do foguete explodir para garantir o prêmio!</li>
          <li>Se o foguete explodir antes de você sacar, você perde a aposta.</li>
        </ul>
        <p><em>⚠️ O ponto de explosão é aleatório entre 1× e 5×. Quanto mais você espera, maior o risco!</em></p>
      `
    },
    craps: {
      titulo: '🎲 Dados (Craps) — Regras',
      conteudo: `
        <p>Jogo clássico de dados estilo Las Vegas!</p>
        <h4>Apostas Principais (lançamento inicial):</h4>
        <ul>
          <li>✅ <strong>Linha da Sorte</strong> — Ganha se rolar 7 ou 11. Perde nos craps (2, 3 ou 12). Qualquer outro número vira o "Ponto" e você continua rolando até acertá-lo (ganha) ou tirar 7 (perde). Paga 2×.</li>
          <li>❌ <strong>Contra a Sorte</strong> — Aposta inversa. Ganha nos craps, perde no 7/11. Paga 2×.</li>
        </ul>
        <h4>Apostas Laterais (qualquer fase):</h4>
        <ul>
          <li>🎯 <strong>Qualquer 7</strong> — O próximo rolo deve ser 7. Paga 4×.</li>
          <li>💥 <strong>Par Duplo</strong> — Acerte o ponto com dois dados iguais antes de tirar 7. Paga 8×.</li>
        </ul>
      `
    },
  };

  function abrirGuia(jogo) {
    let modal = document.getElementById('guiaModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'guiaModal';
      modal.style.cssText = `
        position: fixed; inset: 0; z-index: 9998;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.65); backdrop-filter: blur(6px);
        padding: 16px;
      `;
      modal.innerHTML = `
        <div id="guiaBox" style="
          background: var(--card, #1a1a2e);
          color: var(--text, #f0f0f0);
          border: 1px solid var(--border, rgba(255,255,255,0.12));
          border-radius: 16px;
          padding: 28px 24px 20px;
          max-width: 480px; width: 100%;
          max-height: 80vh; overflow-y: auto;
          position: relative;
          box-shadow: 0 16px 60px rgba(0,0,0,0.7);
        ">
          <button id="guiaFechar" style="
            position: absolute; top: 14px; right: 16px;
            background: none; border: none;
            color: var(--muted, #888); font-size: 1.4rem;
            cursor: pointer; line-height: 1;
          ">✕</button>
          <h2 id="guiaTitulo" style="margin: 0 0 16px; font-size: 1.1rem; color: gold;"></h2>
          <div id="guiaConteudo" style="font-size: .88rem; line-height: 1.6; color: var(--text, #e0e0e0);"></div>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('guiaFechar').addEventListener('click', () => fecharGuia());
      modal.addEventListener('click', e => { if (e.target === modal) fecharGuia(); });
    }

    const regras = REGRAS[jogo];
    if (!regras) return;

    document.getElementById('guiaTitulo').textContent = regras.titulo;
    document.getElementById('guiaConteudo').innerHTML = regras.conteudo;
    modal.style.display = 'flex';
  }

  function fecharGuia() {
    const modal = document.getElementById('guiaModal');
    if (modal) modal.style.display = 'none';
  }

  return { toast, setResultado, renderSaldo, mostrarPagina, selecionarAposta, createElement, mostrarReacao, abrirGuia };
})();
