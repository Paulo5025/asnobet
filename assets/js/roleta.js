const Roleta = (() => {

  // ── Configuração ─────────────────────────────────────────
  const ITEM_W = 90;
  const TOTAL_ITEMS = 24;
  const STOP_INDEX = 12;
  const DURACAO_MS = 4200;

  const CORES = {
    vermelho: { chance: 0.45, img: '../assets/img/v.png', mult: 2, label: 'VERMELHO' },
    azul: { chance: 0.90, img: '../assets/img/a.png', mult: 2, label: 'AZUL' },
    dourado: { chance: 1.00, img: '../assets/img/d.png', mult: 5, label: 'DOURADO' },
  };

  // ── Estado ───────────────────────────────────────────────
  let _escolha = null;
  let _girando = false;

  // ── Helpers ──────────────────────────────────────────────

  function _gerarCor() {
    const r = Math.random();
    if (r < CORES.vermelho.chance) return 'vermelho';
    if (r < CORES.azul.chance) return 'azul';
    return 'dourado';
  }

  function _buildFaixa(faixaEl, sequencia) {
    faixaEl.innerHTML = '';
    faixaEl.style.transition = 'none';
    faixaEl.style.transform = 'translateX(0)';

    sequencia.forEach(cor => {
      const div = document.createElement('div');
      div.className = `faixa-item ${cor}`;
      div.dataset.cor = cor;

      const img = document.createElement('img');
      img.src = CORES[cor].img;
      img.className = 'faixa-img';

      div.appendChild(img);
      faixaEl.appendChild(div);
    });

    // força reflow
    void faixaEl.offsetHeight;
  }

  function _animar(faixaEl, janelaEl) {
    const centro = janelaEl.offsetWidth / 2;
    const deslocamento = (STOP_INDEX * ITEM_W) - centro + ITEM_W / 2;

    faixaEl.style.transition = 'transform 4s cubic-bezier(0.05, 0.8, 0.1, 1)';
    faixaEl.style.transform = `translateX(-${deslocamento}px)`;
  }

  function _detectarResultado(faixaEl, janelaEl) {
    const centroJanela = janelaEl.getBoundingClientRect().left + janelaEl.offsetWidth / 2;
    let melhor = null;

    faixaEl.querySelectorAll('.faixa-item').forEach(el => {
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(centroJanela - (rect.left + rect.width / 2));

      if (!melhor || dist < melhor.dist) {
        melhor = { cor: el.dataset.cor, dist };
      }
    });

    return melhor?.cor ?? 'vermelho';
  }

  function _resetarBotoes() {
    document.querySelectorAll('.cor-btn').forEach(b => {
      b.classList.remove('selected');
    });
  }

  // ── Função principal ─────────────────────────────────────

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

    const faixaEl = document.getElementById('faixa');
    const janelaEl = document.querySelector('.janela');

    const sequencia = Array.from({ length: TOTAL_ITEMS }, _gerarCor);

    _buildFaixa(faixaEl, sequencia);
    _animar(faixaEl, janelaEl);

    UI.setResultado('resultadoRoleta', 'Girando...', 'neutro');

    setTimeout(() => {
      const resultado = _detectarResultado(faixaEl, janelaEl);
      const { img, mult, label } = CORES[resultado];

      if (resultado === _escolha) {
        const premio = aposta * mult;
        Store.alterarSaldo(premio);

        UI.setResultado(
          'resultadoRoleta',
          `${label} — Você ganhou R$ ${premio}! 🎉`,
          'ganhou'
        );
      } else {
        UI.setResultado(
          'resultadoRoleta',
          `${label} — Você perdeu ❌`,
          'perdeu'
        );
      }

      _resetarBotoes();
      _girando = false;

    }, DURACAO_MS);
  }

  return { apostar };

})();