/**
 * app.js
 * Ponto de entrada da aplicação.
 * Responsável por:
 *  - Conectar o Store à UI (reatividade de saldo)
 *  - Registrar todos os event listeners globais
 *  - Controlar a navegação entre páginas
 *  - Inicializar módulos de jogo ao entrar numa página
 */

const App = (() => {
  // ── Bootstrap ─────────────────────────────────────────────────────────────────

  function init() {
    _connectStore();
    _bindNavigation();
    _bindBetSelectors();
    _bindGameButtons();

    // Renderiza saldo inicial
    UI.renderSaldo(Store.getSaldo());

    // Garante que a home aparece primeiro
    UI.mostrarPagina('home');
  }

  // ── Reatividade: Store → UI ───────────────────────────────────────────────────

  function _connectStore() {
    Store.on('saldo', UI.renderSaldo);
  }

  // ── Navegação ─────────────────────────────────────────────────────────────────

  function _bindNavigation() {
    // Delegação de eventos: qualquer elemento com data-navigate="<pagina>"
    document.addEventListener('click', e => {
      const alvo = e.target.closest('[data-navigate]');
      if (!alvo) return;
      _navegarPara(alvo.dataset.navigate);
    });
  }

  function _navegarPara(pagina) {
    UI.mostrarPagina(pagina);
    Store.setPagina(pagina);

    // Hooks de inicialização por página
    if (pagina === 'cartas') Cartas.init();
  }

  // ── Seletores de aposta ───────────────────────────────────────────────────────

  function _bindBetSelectors() {
    // Delegação para todos os .bet-btn dentro de .bet-btns
    document.addEventListener('click', e => {
      const btn = e.target.closest('.bet-btn');
      if (!btn) return;
      const valor = Number(btn.dataset.valor);
      if (!isNaN(valor)) UI.selecionarAposta(btn, valor);
    });
  }

  // ── Botões dos jogos ──────────────────────────────────────────────────────────

  function _bindGameButtons() {
    // Jackpot
    document.getElementById('btnJackpot')?.addEventListener('click', Jackpot.girar);

    // Roleta — delegação para .cor-btn
    document.getElementById('pageRoleta')?.addEventListener('click', e => {
      const btn = e.target.closest('.cor-btn');
      if (!btn) return;
      Roleta.apostar(btn.dataset.cor, btn);
    });

    // Cartas
    document.getElementById('btnCartas')?.addEventListener('click', Cartas.sortear);

    // Limit — delegação para .limit-btn e botão custom
    document.getElementById('pageLimit')?.addEventListener('click', e => {
      const btn = e.target.closest('.limit-btn[data-tipo]');
      if (btn) {
        Limit.apostar(btn.dataset.tipo, Number(btn.dataset.valor), btn);
      }
      if (e.target.id === 'btnCustomLimit') {
        Limit.apostarCustom();
      }
    });

    // Rocket
    document.getElementById('btnRocket')?.addEventListener('click', Rocket.iniciar);


    // Recarregar saldo
    document.getElementById('btnRecarregar')?.addEventListener('click', () => {
      Store.resetarSaldo();
      UI.toast('💰 Saldo recarregado!');
    });
  }

  return { init };
})();

// ── Inicializa após o DOM estar pronto ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', App.init);

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnRocket")
    .addEventListener("click", Rocket.iniciar);
});
