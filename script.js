const valores = [0, 3, 5, 7];

function girar() {
    const r1 = document.getElementById("rolo1");
    const r2 = document.getElementById("rolo2");
    const r3 = document.getElementById("rolo3");
    const resultadoTexto = document.getElementById("resultado");

    resultadoTexto.innerHTML = "Girando...";

    let v1, v2, v3;

    let intervalo = setInterval(() => {
        r1.innerText = valores[Math.floor(Math.random() * valores.length)];
        r2.innerText = valores[Math.floor(Math.random() * valores.length)];
        r3.innerText = valores[Math.floor(Math.random() * valores.length)];
    }, 100);

    setTimeout(() => {
        clearInterval(intervalo);

        v1 = valores[Math.floor(Math.random() * valores.length)];
        v2 = valores[Math.floor(Math.random() * valores.length)];
        v3 = valores[Math.floor(Math.random() * valores.length)];

        r1.innerText = v1;
        r2.innerText = v2;
        r3.innerText = v3;

        verificarResultado(v1, v2, v3);
    }, 2000);
}

function verificarResultado(a, b, c) {
    const texto = document.getElementById("resultado");

    if (a === b && b === c) {
        if (a === 7) {
            texto.innerHTML = "🎉 JACKPOT!!! 💰💰💰";
        } else {
            texto.innerHTML = "Você ganhou! 🎉";
        }
    } else {
        texto.innerHTML = "Tente novamente ❌";
    }
}

function irPara(pagina) {
    window.location.href = pagina;
}

// botão voltar
function voltarHome() {
  window.location.href = "index.html";
}