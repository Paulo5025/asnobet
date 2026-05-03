/**
 * craps.js
 * Lógica do jogo Craps (dados).
 *
 * Regras implementadas:
 *  - Come-out roll: soma 7 ou 11 → Pass Line ganha (2x); soma 2, 3 ou 12 → craps, perde.
 *  - Qualquer outro valor vira o "point". O jogador rola até acertar o point (ganha) ou tirar 7 (perde).
 *  - Don't Pass: aposta inversa — ganha no craps (exceto 12 = empate), perde no 7/11.
 *  - Any 7: aposta lateral — ganha se o próximo rolo for 7 (paga 4x), senão perde.
 *  - Hard Way (par duplo): aposta lateral — ganha se tirar exatamente (n/2, n/2) antes de 7 ou soma fácil.
 *
 * Dependências (carregadas antes): Store, UI
 */

const Craps = (() => {
  // ── Configuração ─────────────────────────────────────────────────────────────
  const CRAPS_NUMS   = [2, 3, 12];
  const NATURAL_NUMS = [7, 11];
  const ROLL_DELAY   = 700;   // ms entre rolls no modo automático
  const DIE_FRAMES   = 8;     // frames da animação de dado

  const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  const MULT = {
    passLine:  2,    // devolve aposta + lucro igual
    dontPass:  2,
    any7:      4,
    hardWay:   8,
  };

  // ── Estado local ─────────────────────────────────────────────────────────────
  let _fase          = 'come-out';   // 'come-out' | 'point'
  let _point         = null;
  let _aposta        = {};           // { tipo, valor } — aposta lateral ativa
  let _rolando       = false;
  let _apostaPrincipal = null;       // 'passLine' | 'dontPass' | null

  // ── Helpers de dado ──────────────────────────────────────────────────────────

  function _rolarDado() {
    return Math.floor(Math.random() * 6) + 1;
  }

  /** Anima um dado com faces aleatórias e resolve com o valor final. */
  function _animarDado(elId, valorFinal) {
    return new Promise(resolve => {
      const el    = document.getElementById(elId);
      let ticks   = 0;
      const total = DIE_FRAMES;

      const iv = setInterval(() => {
        el.textContent = FACES[Math.floor(Math.random() * 6)];
        ticks++;
        if (ticks >= total) {
          clearInterval(iv);
          el.textContent = FACES[valorFinal - 1];
          resolve();
        }
      }, 60);
    });
  }

  async function _rolarComAnimacao() {
    const d1 = _rolarDado();
    const d2 = _rolarDado();

    _rolando = true;
    _setBotoesAtivos(false);

    await Promise.all([
      _animarDado('crapsDado1', d1),
      _animarDado('crapsDado2', d2),
    ]);

    _rolando = false;
    return { d1, d2, soma: d1 + d2 };
  }

  // ── Renderização de estado ────────────────────────────────────────────────────

  function _renderFase() {
    const faseEl  = document.getElementById('crapsFase');
    const pointEl = document.getElementById('crapsPoint');

    if (_fase === 'come-out') {
      faseEl.textContent  = 'Lançamento Inicial';
      faseEl.className    = 'craps-fase neutro';
      pointEl.textContent = '—';
      pointEl.dataset.ativo = 'false';
    } else {
      faseEl.textContent  = `Fase: Ponto`;
      faseEl.className    = 'craps-fase ativo';
      pointEl.textContent = _point;
      pointEl.dataset.ativo = 'true';
    }
  }

  function _renderLog(msg, tipo = 'neutro') {
    const log = document.getElementById('crapsLog');
    if (!log) return;

    const item = UI.createElement('div', { className: `craps-log-item ${tipo}`, textContent: msg });
    log.prepend(item);

    // Mantém apenas os últimos 5 registros
    while (log.children.length > 5) log.removeChild(log.lastChild);
  }

  function _setBotoesAtivos(ativo) {
    const ids = ['btnCrapsRolar', 'btnCrapsPassLine', 'btnCrapsDontPass', 'btnCrapsAny7', 'btnCrapsHardWay'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = !ativo;
    });
  }

  function _renderApostasLaterais() {
    const any7El     = document.getElementById('crapsApostasLaterais');
    const hardWayEl  = document.getElementById('crapsHardWayInfo');

    if (_aposta.tipo === 'any7') {
      any7El.textContent    = `Qualquer 7 ativo: R$ ${_aposta.valor}`;
      any7El.dataset.ativo  = 'true';
    } else {
      any7El.textContent    = 'Qualquer 7: inativo';
      any7El.dataset.ativo  = 'false';
    }

    if (_aposta.tipo === 'hardWay') {
      hardWayEl.textContent   = `Par Duplo ${_aposta.alvo} ativo: R$ ${_aposta.valor}`;
      hardWayEl.dataset.ativo = 'true';
    } else {
      hardWayEl.textContent   = 'Par Duplo: inativo';
      hardWayEl.dataset.ativo = 'false';
    }
  }

  // ── Resolução das apostas laterais ───────────────────────────────────────────

  function _resolverApostasLaterais(d1, d2, soma) {
    if (!_aposta.tipo) return;

    if (_aposta.tipo === 'any7') {
      if (soma === 7) {
        const prize = _aposta.valor * MULT.any7;
        Store.alterarSaldo(prize);
        _renderLog(`Qualquer 7 saiu! +R$ ${prize} 🎲`, 'ganhou');
      } else {
        _renderLog(`Qualquer 7 perdeu (saiu ${soma})`, 'perdeu');
      }
      _aposta = {};
    }

    if (_aposta.tipo === 'hardWay') {
      const alvo = _aposta.alvo;
      const metade = alvo / 2;
      const eHard  = d1 === d2 && soma === alvo;
      const perdeu = soma === 7 || (soma === alvo && !eHard);

      if (eHard) {
        const prize = _aposta.valor * MULT.hardWay;
        Store.alterarSaldo(prize);
        _renderLog(`Par Duplo ${alvo} acertado! +R$ ${prize} 🎲`, 'ganhou');
        _aposta = {};
      } else if (perdeu) {
        _renderLog(`Par Duplo perdeu (saiu ${d1}+${d2})`, 'perdeu');
        _aposta = {};
      }
    }

    _renderApostasLaterais();
  }

  // ── Lógica de rolo ────────────────────────────────────────────────────────────

  async function _processarComeOut(d1, d2, soma) {
    if (NATURAL_NUMS.includes(soma)) {
      // 7 ou 11 — Pass Line ganha
      _renderLog(`Lançamento: ${soma} — Natural! 🎉`, 'ganhou');

      if (_apostaPrincipal === 'passLine') {
        const prize = Store.getAposta() * MULT.passLine;
        Store.alterarSaldo(prize);
        UI.setResultado('resultadoCraps', `🎉 Natural ${soma}! +R$ ${prize}`, 'ganhou');
        UI.mostrarReacao('ganhou');
      } else if (_apostaPrincipal === 'dontPass') {
        UI.setResultado('resultadoCraps', `Natural ${soma} — Contra a Sorte perdeu ❌`, 'perdeu');
        UI.mostrarReacao('perdeu');
      } else {
        UI.setResultado('resultadoCraps', `Natural ${soma}! Aposte na próxima rodada.`, 'neutro');
      }

      _apostaPrincipal = null;
      _fase = 'come-out';

    } else if (CRAPS_NUMS.includes(soma)) {
      // 2, 3 ou 12 — Craps
      const empate = soma === 12 && _apostaPrincipal === 'dontPass';

      if (empate) {
        Store.alterarSaldo(Store.getAposta()); // devolve a aposta
        _renderLog(`Craps ${soma} — Empate (Contra a Sorte)`, 'neutro');
        UI.setResultado('resultadoCraps', `Craps ${soma} — Empate! Aposta devolvida.`, 'neutro');
      } else if (_apostaPrincipal === 'dontPass') {
        const prize = Store.getAposta() * MULT.dontPass;
        Store.alterarSaldo(prize);
        _renderLog(`Craps ${soma} — Contra a Sorte ganha! 🎉`, 'ganhou');
        UI.setResultado('resultadoCraps', `🎉 Craps ${soma}! Contra a Sorte +R$ ${prize}`, 'ganhou');
        UI.mostrarReacao('ganhou');
      } else if (_apostaPrincipal === 'passLine') {
        _renderLog(`Craps ${soma} — Linha da Sorte perde ❌`, 'perdeu');
        UI.setResultado('resultadoCraps', `Craps ${soma} — Pass Line perdeu ❌`, 'perdeu');
        UI.mostrarReacao('perdeu');
      } else {
        _renderLog(`Craps ${soma}!`, 'perdeu');
        UI.setResultado('resultadoCraps', `Craps ${soma}! Aposte na próxima.`, 'neutro');
      }

      _apostaPrincipal = null;
      _fase = 'come-out';

    } else {
      // Estabelece o point
      _point = soma;
      _fase  = 'point';
      _renderLog(`Ponto estabelecido: ${soma}`, 'neutro');
      UI.setResultado('resultadoCraps', `Ponto: ${soma} — Role até acertar ou sair 7`, 'neutro');
    }

    _renderFase();
  }

  async function _processarPoint(d1, d2, soma) {
    if (soma === _point) {
      _renderLog(`Ponto ${soma} acertado! 🎉`, 'ganhou');

      if (_apostaPrincipal === 'passLine') {
        const prize = Store.getAposta() * MULT.passLine;
        Store.alterarSaldo(prize);
        UI.setResultado('resultadoCraps', `🎉 Ponto ${soma}! Linha da Sorte +R$ ${prize}`, 'ganhou');
        UI.mostrarReacao('ganhou');
      } else if (_apostaPrincipal === 'dontPass') {
        UI.setResultado('resultadoCraps', `Ponto ${soma} — Contra a Sorte perdeu ❌`, 'perdeu');
        UI.mostrarReacao('perdeu');
      } else {
        UI.setResultado('resultadoCraps', `🎉 Ponto ${soma} acertado!`, 'ganhou');
        UI.mostrarReacao('ganhou');
      }

      _apostaPrincipal = null;
      _fase  = 'come-out';
      _point = null;

    } else if (soma === 7) {
      _renderLog(`Saiu Sete! Ponto perdido ❌`, 'perdeu');

      if (_apostaPrincipal === 'dontPass') {
        const prize = Store.getAposta() * MULT.dontPass;
        Store.alterarSaldo(prize);
        UI.setResultado('resultadoCraps', `🎉 Saiu Sete! Contra a Sorte +R$ ${prize}`, 'ganhou');
        UI.mostrarReacao('ganhou');
      } else if (_apostaPrincipal === 'passLine') {
        UI.setResultado('resultadoCraps', `Saiu Sete! Linha da Sorte perdeu ❌`, 'perdeu');
        UI.mostrarReacao('perdeu');
      } else {
        UI.setResultado('resultadoCraps', `Saiu Sete! Volta ao lançamento inicial.`, 'perdeu');
        UI.mostrarReacao('perdeu');
      }

      _apostaPrincipal = null;
      _fase  = 'come-out';
      _point = null;

    } else {
      _renderLog(`Rolo: ${soma} — Continue...`, 'neutro');
      UI.setResultado('resultadoCraps', `Saiu ${soma} — Ponto ainda é ${_point}. Role de novo!`, 'neutro');
    }

    _renderFase();
  }

  // ── API pública ───────────────────────────────────────────────────────────────

  /** Inicializa o estado ao entrar na página. */
  function init() {
    _fase            = 'come-out';
    _point           = null;
    _apostaPrincipal = null;
    _aposta          = {};

    _renderFase();
    _renderApostasLaterais();
    _renderLog('Bem-vindo aos Dados! Faça sua aposta.', 'neutro');
    UI.setResultado('resultadoCraps', 'Faça uma aposta e role os dados', 'neutro');

    const log = document.getElementById('crapsLog');
    if (log) log.innerHTML = '';
    _renderLog('Bem-vindo aos Dados! Faça sua aposta.', 'neutro');

    const d1 = document.getElementById('crapsDado1');
    const d2 = document.getElementById('crapsDado2');
    if (d1) d1.textContent = '⚄';
    if (d2) d2.textContent = '⚄';

    _setBotoesAtivos(true);
  }

  /** Aposta Pass Line antes do come-out. */
  function apostarPassLine() {
    if (_rolando) return;
    if (_apostaPrincipal) { UI.toast('Já existe uma aposta principal ativa!'); return; }

    const aposta = Store.getAposta();
    if (!Store.alterarSaldo(-aposta)) { UI.toast('💸 Saldo insuficiente!'); return; }

    _apostaPrincipal = 'passLine';
    UI.toast(`Linha da Sorte: R$ ${aposta}`);
    _renderLog(`Linha da Sorte: R$ ${aposta}`, 'neutro');
    UI.setResultado('resultadoCraps', 'Linha da Sorte ativa — Role os dados!', 'neutro');
  }

  /** Aposta Don't Pass antes do come-out. */
  function apostarDontPass() {
    if (_rolando) return;
    if (_apostaPrincipal) { UI.toast('Já existe uma aposta principal ativa!'); return; }

    const aposta = Store.getAposta();
    if (!Store.alterarSaldo(-aposta)) { UI.toast('💸 Saldo insuficiente!'); return; }

    _apostaPrincipal = 'dontPass';
    UI.toast(`Contra a Sorte: R$ ${aposta}`);
    _renderLog(`Contra a Sorte: R$ ${aposta}`, 'neutro');
    UI.setResultado('resultadoCraps', "Contra a Sorte ativa — Role os dados!", 'neutro');
  }

  /** Aposta lateral Any 7 (resolve no próximo rolo). */
  function apostarAny7() {
    if (_rolando) return;
    if (_aposta.tipo) { UI.toast('Já existe uma aposta lateral ativa!'); return; }

    const aposta = Store.getAposta();
    if (!Store.alterarSaldo(-aposta)) { UI.toast('💸 Saldo insuficiente!'); return; }

    _aposta = { tipo: 'any7', valor: aposta };
    _renderApostasLaterais();
    UI.toast(`Qualquer 7: R$ ${aposta}`);
  }

  /** Aposta lateral Hard Way — precisa estar na fase point com número par. */
  function apostarHardWay() {
    if (_rolando) return;
    if (_aposta.tipo) { UI.toast('Já existe uma aposta lateral ativa!'); return; }
    if (_fase !== 'point' || _point % 2 !== 0) {
      UI.toast('Par Duplo só na fase Ponto com número par (4,6,8,10)!');
      return;
    }

    const aposta = Store.getAposta();
    if (!Store.alterarSaldo(-aposta)) { UI.toast('💸 Saldo insuficiente!'); return; }

    _aposta = { tipo: 'hardWay', valor: aposta, alvo: _point };
    _renderApostasLaterais();
    UI.toast(`Par Duplo ${_point}: R$ ${aposta}`);
  }

  /** Rola os dados e processa o resultado. */
  async function rolar() {
    if (_rolando) return;

    const { d1, d2, soma } = await _rolarComAnimacao();

    _resolverApostasLaterais(d1, d2, soma);

    if (_fase === 'come-out') {
      await _processarComeOut(d1, d2, soma);
    } else {
      await _processarPoint(d1, d2, soma);
    }

    _setBotoesAtivos(true);
  }

  return { init, rolar, apostarPassLine, apostarDontPass, apostarAny7, apostarHardWay };
})();
