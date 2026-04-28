/**
 * store.js
 * Gerenciamento de estado global da aplicação (padrão Observer simplificado).
 * Toda a lógica de negócio acessa o estado apenas por meio deste módulo.
 */

const Store = (() => {
  // ── Estado privado ──────────────────────────────────────────────────────────
  const _state = {
    saldo:       1000,
    apostaAtual: 10,
    paginaAtual: 'home',
  };

  /** @type {Record<string, Function[]>} */
  const _listeners = {};

  // ── Pub/Sub ─────────────────────────────────────────────────────────────────

  /**
   * Registra um ouvinte para uma chave de estado.
   * @param {string}   key
   * @param {Function} fn  Chamado com (novoValor, valorAnterior)
   */
  function on(key, fn) {
    if (!_listeners[key]) _listeners[key] = [];
    _listeners[key].push(fn);
  }

  function _emit(key, next, prev) {
    (_listeners[key] || []).forEach(fn => fn(next, prev));
  }

  // ── Getters ─────────────────────────────────────────────────────────────────
  function getSaldo()       { return _state.saldo; }
  function getAposta()      { return _state.apostaAtual; }
  function getPagina()      { return _state.paginaAtual; }

  // ── Setters com validação ────────────────────────────────────────────────────

  /**
   * Aplica um delta ao saldo (positivo = ganho, negativo = custo).
   * @param {number} delta
   * @returns {boolean} false se saldo insuficiente para debitar
   */
  function alterarSaldo(delta) {
    const prev = _state.saldo;
    const next  = Math.max(0, prev + delta);
    if (delta < 0 && prev < Math.abs(delta)) return false;
    _state.saldo = next;
    _emit('saldo', next, prev);
    return true;
  }

  function resetarSaldo() {
    const prev = _state.saldo;
    _state.saldo = 1000;
    _emit('saldo', 1000, prev);
  }

  /**
   * @param {number} valor  Valor da aposta em R$
   */
  function setAposta(valor) {
    const prev = _state.apostaAtual;
    _state.apostaAtual = valor;
    _emit('apostaAtual', valor, prev);
  }

  /**
   * @param {string} pagina
   */
  function setPagina(pagina) {
    const prev = _state.paginaAtual;
    _state.paginaAtual = pagina;
    _emit('paginaAtual', pagina, prev);
  }

  return { on, getSaldo, getAposta, getPagina, alterarSaldo, resetarSaldo, setAposta, setPagina };
})();
