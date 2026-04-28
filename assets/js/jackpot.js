/**
 * jackpot.js
 * Lógica do jogo Jackpot (três rolos).
 *
 * Dependências (carregadas antes): Store, UI
 */

const Jackpot = (() => {
  // ── Configuração ─────────────────────────────────────────────────────────────
  const SIMBOLOS    = ['0', '3', '5', '7', '⭐', '💎'];
  const DURACAO_MS  = 2000;
  const TICK_MS     = 80;

  const MULTIPLOS = {
    '7':  10,  // jackpot
    '💎': 8,
    '⭐': 6,
    default: 3,
  };

  // ── Helpers internos ─────────────────────────────────────────────────────────

  function _simboloAleatorio() {
    return SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)];
  }

  function _getRolos() {
    return ['rolo1', 'rolo2', 'rolo3'].map(id => document.getElementById(id));
  }

  /** Inicia a animação de giro nos três rolos e retorna o intervalo. */
  function _iniciarAnimacao(rolos) {
    rolos.forEach(r => r.classList.add('spinning'));
    return setInterval(() => {
      rolos.forEach(r => { r.textContent = _simboloAleatorio(); });
    }, TICK_MS);
  }

  /** Para a animação e define valores finais aleatórios. */
  function _pararAnimacao(rolos, intervalo) {
    clearInterval(intervalo);
    rolos.forEach(r => r.classList.remove('spinning'));
    return rolos.map(r => {
      const v = _simboloAleatorio();
      r.textContent = v;
      return v;
    });
  }

  /** Calcula o prêmio dado que os três valores são iguais. */
  function _calcularPremio(simbolo, aposta) {
    const mult = MULTIPLOS[simbolo] ?? MULTIPLOS.default;
    return aposta * mult;
  }

  // ── API pública ───────────────────────────────────────────────────────────────

  function girar() {
    const aposta = Store.getAposta();
    if (!Store.alterarSaldo(-aposta)) {
      UI.toast('💸 Saldo insuficiente!');
      return;
    }

    const btn   = document.getElementById('btnJackpot');
    const rolos = _getRolos();

    btn.disabled = true;
    UI.setResultado('resultadoJackpot', 'Girando…', 'neutro');

    const intervalo = _iniciarAnimacao(rolos);

    setTimeout(() => {
      const valores = _pararAnimacao(rolos, intervalo);
      const [v1, v2, v3] = valores;

      if (v1 === v2 && v2 === v3) {
        const premio = _calcularPremio(v1, aposta);
        Store.alterarSaldo(premio);

        const msg = v1 === '7'
          ? `🎉 JACKPOT!!! + R$ ${premio}`
          : `🎉 Você ganhou! + R$ ${premio}`;

        UI.setResultado('resultadoJackpot', msg, 'ganhou');
      } else {
        UI.setResultado('resultadoJackpot', 'Tente novamente ❌', 'perdeu');
      }

      btn.disabled = false;
    }, DURACAO_MS);
  }

  return { girar };
})();
