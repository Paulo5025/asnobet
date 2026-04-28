/**
 * limit.js
 * Lógica do jogo Limit Rush (barra de progresso aleatória).
 *
 * Dependências (carregadas antes): Store, UI
 */

const Limit = (() => {
  // ── Configuração ─────────────────────────────────────────────────────────────
  const TICK_MS    = 50;
  const MAX_STEP   = 6;      // variação máxima por tick
  const DURACAO_MS = 2200;   // tempo até parar

  const TIPOS = {
    baixo:  { margem: 25,  mult: 2,  label: 'Você acertou!' },
    medio:  { margem: 0,   mult: 20, label: 'ACERTO EXATO! 🎯' },
    alto:   { margem: 5,   mult: 8,  label: 'Quase perfeito! 🏆' },
  };

  // ── Estado local ─────────────────────────────────────────────────────────────
  let _tipo         = null;
  let _apostaValor  = null;
  let _girando      = false;
  let _btnAtivo     = null;

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function _setBarra(pct) {
    const barra = document.getElementById('barra');
    const label = document.getElementById('porcentagem');
    if (barra) barra.style.width = `${pct}%`;
    if (label) label.textContent = `${Math.floor(pct)}%`;
  }

  function _ativarBtn(btn) {
    if (_btnAtivo) _btnAtivo.classList.remove('active');
    _btnAtivo = btn;
    if (btn) btn.classList.add('active');
  }

  /** Verifica se o valor final é um acerto conforme o tipo de aposta. */
  function _verificar(final) {
    const { margem } = TIPOS[_tipo];

    if (_tipo === 'baixo') {
      return final >= _apostaValor && final <= _apostaValor + margem;
    }
    if (_tipo === 'medio') {
      return final === _apostaValor;
    }
    // alto
    return final >= _apostaValor - margem && final <= _apostaValor + margem;
  }

  // ── Lógica de execução ────────────────────────────────────────────────────────

  function _iniciar() {
    _girando = true;

    const aposta = Store.getAposta();
    if (!Store.alterarSaldo(-aposta)) {
      UI.toast('💸 Saldo insuficiente!');
      _girando = false;
      return;
    }

    _setBarra(0);
    UI.setResultado('resultadoLimit', 'Carregando…', 'neutro');

    let progresso = 0;
    const intervalo = setInterval(() => {
      progresso = Math.min(100, progresso + Math.random() * MAX_STEP);
      _setBarra(progresso);
    }, TICK_MS);

    setTimeout(() => {
      clearInterval(intervalo);

      const final = Math.floor(Math.random() * 100) + 1;
      _setBarra(final);

      const aposta = Store.getAposta();

      if (_verificar(final)) {
        const { mult, label } = TIPOS[_tipo];
        const premio = aposta * mult;
        Store.alterarSaldo(premio);
        UI.setResultado('resultadoLimit', `${label} + R$ ${premio} 🎉`, 'ganhou');
      } else {
        UI.setResultado('resultadoLimit', 'Você perdeu ❌', 'perdeu');
      }

      _ativarBtn(null);
      _girando = false;
    }, DURACAO_MS);
  }

  // ── API pública ───────────────────────────────────────────────────────────────

  /**
   * @param {'baixo'|'medio'|'alto'} tipo
   * @param {number}                 valor   Início do intervalo ou valor exato
   * @param {HTMLElement}            btn
   */
  function apostar(tipo, valor, btn) {
    if (_girando) return;
    _tipo        = tipo;
    _apostaValor = valor;
    _ativarBtn(btn);
    _iniciar();
  }

  /** Aposta personalizada (tipo 'alto' com % digitada pelo usuário). */
  function apostarCustom() {
    if (_girando) return;
    const input = document.getElementById('customLimit');
    const val   = parseInt(input?.value ?? '', 10);

    if (isNaN(val) || val < 1 || val > 100) {
      UI.toast('Digite um valor entre 1 e 100');
      return;
    }

    _tipo        = 'alto';
    _apostaValor = val;
    _ativarBtn(null);
    _iniciar();
  }

  return { apostar, apostarCustom };
})();
