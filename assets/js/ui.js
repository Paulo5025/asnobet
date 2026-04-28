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

  return { toast, setResultado, renderSaldo, mostrarPagina, selecionarAposta, createElement };
})();
