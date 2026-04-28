/**
 * roleta.js
 * Lógica do jogo Color Spin (faixa deslizante com cores).
 *
 * Dependências (carregadas antes): Store, UI
 */

const Roleta = (() => {
  // ── Configuração ─────────────────────────────────────────────────────────────
  const ITEM_W       = 90;   // largura de cada item da faixa (px)
  const TOTAL_ITEMS  = 24;
  const STOP_INDEX   = 12;   // índice onde a faixa para (centro da janela)
  const DURACAO_MS   = 4200;

  const CORES = {
    vermelho: { chance: 0.45, emoji: '🔴', mult: 2,  label: 'VERMELHO' },
    azul:     { chance: 0.90, emoji: '🔵', mult: 2,  label: 'AZUL' },
    dourado:  { chance: 1.00, emoji: '⭐', mult: 5,  label: 'DOURADO' },
  };

  // ── Estado local ─────────────────────────────────────────────────────────────
  let _escolha   = null;
  let _girando   = false;

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function _gerarCor() {
    const r = Math.random();
    if (r < CORES.vermelho.chance) return 'vermelho';
    if (r < CORES.azul.chance)     return 'azul';
    return 'dourado';
  }

  /** Constrói a faixa de ícones no DOM. */
  function _buildFaixa(faixaEl, sequencia) {
    faixaEl.innerHTML = '';
    faixaEl.style.transition = 'none';
    faixaEl.style.transform  = 'translateX(0)';

    sequencia.forEach(cor => {
      const div = UI.createElement('div', {
        className: `faixa-item ${cor}`,
        dataset: { cor },
        textContent: CORES[cor].emoji,
      });
      faixaEl.appendChild(div);
    });

    // Força reflow para que a transição CSS funcione depois
    void faixaEl.offsetHeight;
  }

  /** Anima a faixa até o índice de parada. */
  function _animar(faixaEl, janelaEl) {
    const centro = janelaEl.offsetWidth / 2;
    const deslocamento = (STOP_INDEX * ITEM_W) - centro + ITEM_W / 2;

    faixaEl.style.transition = 'transform 4s cubic-bezier(0.05, 0.8, 0.1, 1)';
    faixaEl.style.transform  = `translateX(-${deslocamento}px)`;
  }

  /** Detecta qual item ficou mais próximo do centro da janela. */
  function _detectarResultado(faixaEl, janelaEl) {
    const centroJanela = janelaEl.getBoundingClientRect().left + janelaEl.offsetWidth / 2;
    let melhor = null;

    faixaEl.querySelectorAll('.faixa-item').forEach(el => {
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(centroJanela - (rect.left + rect.width / 2));
      if (!melhor || dist < melhor.dist) melhor = { cor: el.dataset.cor, dist };
    });

    return melhor?.cor ?? 'vermelho';
  }

  // ── Limpeza de UI ────────────────────────────────────────────────────────────
  function _resetarBotoes() {
    document.querySelectorAll('.cor-btn').forEach(b => b.classList.remove('selected'));
  }

  // ── API pública ───────────────────────────────────────────────────────────────

  /**
   * Chamado quando o usuário clica num botão de cor.
   * @param {string}      cor
   * @param {HTMLElement} btn
   */
  function apostar(cor, btn) {
    if (_girando) return;

    const aposta = Store.getAposta();
    if (!Store.alterarSaldo(-aposta)) {
      UI.toast('💸 Saldo insuficiente!');
      return;
    }

    _resetarBotoes();
    btn.classList.add('selected');
    _escolha = cor;
    _girando = true;

    const faixaEl  = document.getElementById('faixa');
    const janelaEl = document.querySelector('.janela');

    const sequencia = Array.from({ length: TOTAL_ITEMS }, _gerarCor);
    _buildFaixa(faixaEl, sequencia);
    _animar(faixaEl, janelaEl);

    UI.setResultado('resultadoRoleta', 'Girando…', 'neutro');

    setTimeout(() => {
      const resultado   = _detectarResultado(faixaEl, janelaEl);
      const { emoji, mult, label } = CORES[resultado];

      if (resultado === _escolha) {
        const premio = aposta * mult;
        Store.alterarSaldo(premio);
        UI.setResultado('resultadoRoleta', `${emoji} ${label} — Você ganhou R$ ${premio}! 🎉`, 'ganhou');
      } else {
        UI.setResultado('resultadoRoleta', `${emoji} ${label} — Você perdeu ❌`, 'perdeu');
      }

      _resetarBotoes();
      _girando = false;
    }, DURACAO_MS);
  }

  return { apostar };
})();
