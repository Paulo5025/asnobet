const Rocket = (() => {
    let aposta = 10;
    let rodando = false;
    let multiplicador = 1;
    let crashPoint = 0;
    let interval = null;

    function iniciar() {
        if (!rodando) {
            _start();
        } else {
            sacar();
        }
    }

    function _start() {
        const activeBtn = document.querySelector("#pageRocket .bet-btn.active");
        aposta = Number(activeBtn.dataset.valor);
        const display = document.getElementById("multiplier");
        const resultado = document.getElementById("resultadoRocket");
        const rocketImg = document.getElementById("rocketImg");
        const btn = document.getElementById("btnRocket");
        if (!Store.alterarSaldo(-aposta)) {
            UI.toast("Saldo insuficiente 💸");
            return;
        }


        rodando = true;
        multiplicador = 1;

        crashPoint = (Math.random() * 4 + 1);

        btn.innerText = "SACAR";
        resultado.innerText = "Subindo... 🚀";

        const bg = document.getElementById("rocketBg");

        interval = setInterval(() => {
            // 1. Atualiza primeiro
            multiplicador += 0.02;
            // 2. Atualiza UI
            display.innerText = multiplicador.toFixed(2) + "x";
            // foguete sobe
            rocketImg.style.transform = `translateY(-${multiplicador * 10}px)`;
            // fundo desce (efeito de subida)
            bg.style.transform = `translateY(${multiplicador * 5}px)`;
            // 3. Verifica crash
            if (multiplicador >= crashPoint) {
                explodir();
            }
        }, 50);
    }

    function sacar() {
        const resultado = document.getElementById("resultadoRocket");
        const btn = document.getElementById("btnRocket");
        const ganho = aposta * multiplicador;
        Store.alterarSaldo(ganho);

        clearInterval(interval);
        rodando = false;

        btn.innerText = "INICIAR";
        resultado.innerHTML = `Você sacou em ${multiplicador.toFixed(2)}x 💰<br>Ganhou: R$ ${ganho.toFixed(2)}`;

        _reset();
    }

    function explodir() {
        const resultado = document.getElementById("resultadoRocket");
        const btn = document.getElementById("btnRocket");

        clearInterval(interval);
        rodando = false;

        btn.innerText = "INICIAR";
        resultado.innerHTML = `💥 Explodiu em ${crashPoint.toFixed(2)}x — Você perdeu`;

        _reset();
    }

    function _reset() {
        const display = document.getElementById("multiplier");
        const rocketImg = document.getElementById("rocketImg");

        setTimeout(() => {
            multiplicador = 1;
            display.innerText = "1.00x";
            rocketImg.style.transform = "translateY(0)";
        }, 1500);
    }

    return { iniciar };
})();

document.getElementById("btnRocket")
    .addEventListener("click", Rocket.iniciar);