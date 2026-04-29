/**
 * cartas.js
 * Lógica do jogo Lucky Draw 10.
 *
 * Dependências (carregadas antes): Store, UI
 */

const Cartas = (() => {
  // ── Configuração ─────────────────────────────────────────────────────────────
  const TOTAL_CARTAS = 10;
  const MULTIPLICADOR = 8;
  const DELAY_REVEAL_MS = 600;

  // ── Estado local ─────────────────────────────────────────────────────────────
  let _cartaEscolhida = null;

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function _sortearCarta() {
    return Math.floor(Math.random() * TOTAL_CARTAS) + 1;
  }

  function _resetarGrid() {
    document.querySelectorAll('.carta-item').forEach(c => c.classList.remove('selecionada'));
  }

  function _esconderRevelacao() {
    const el = document.getElementById('cartaRevelada');
    if (el) el.classList.remove('visible');
  }

  function _mostrarRevelacao(numero) {
    const container = document.getElementById('cartaRevelada');
    const numEl     = document.getElementById('cartaNum');
    if (container && numEl) {
      numEl.innerHTML = `<img src="../assets/img/Carta${numero}.png" alt="Carta ${numero}" class="carta-img-revelada">`;
      container.classList.add('visible');
    }
  }

  // ── API pública ───────────────────────────────────────────────────────────────

  /** Reconstrói o grid de cartas (chamado ao entrar na página). */
  function init() {
    _cartaEscolhida = null;

    const grid = document.getElementById('cartasGrid');
    if (!grid) return;

    grid.innerHTML = '';
    _esconderRevelacao();
    UI.setResultado('resultadoCartas', 'Selecione uma carta para começar', 'neutro');

    for (let i = 1; i <= TOTAL_CARTAS; i++) {
      const carta = document.createElement('div');
      carta.className = 'carta-item carta-item-img';
      const img = document.createElement('img');
      img.src = `../assets/img/Carta${i}.png`;
      img.alt = `Carta ${i}`;
      img.className = 'carta-img';
      carta.appendChild(img);
      carta.addEventListener('click', () => _selecionar(i, carta));
      grid.appendChild(carta);
    }
  }

  /** Marca a carta escolhida pelo jogador. */
  function _selecionar(valor, el) {
    _cartaEscolhida = valor;
    _resetarGrid();
    el.classList.add('selecionada');
  }

  /** Realiza o sorteio e exibe o resultado. */
  function sortear() {
    if (_cartaEscolhida === null) {
      UI.toast('Escolha uma carta primeiro!');
      return;
    }

    const aposta = Store.getAposta();
    if (!Store.alterarSaldo(-aposta)) {
      UI.toast('💸 Saldo insuficiente!');
      return;
    }

    const btn = document.getElementById('btnCartas');
    btn.disabled = true;

    setTimeout(() => {
      const sorteada = _sortearCarta();
      _mostrarRevelacao(sorteada);

      if (sorteada === _cartaEscolhida) {
        const premio = aposta * MULTIPLICADOR;
        Store.alterarSaldo(premio);
        UI.setResultado('resultadoCartas', `🎉 Carta ${sorteada} — VOCÊ GANHOU R$ ${premio}!`, 'ganhou');
      } else {
        UI.setResultado('resultadoCartas', `Carta ${sorteada} — Você perdeu ❌`, 'perdeu');
      }

      btn.disabled = false;
    }, DELAY_REVEAL_MS);
  }

  return { init, sortear };
})();
