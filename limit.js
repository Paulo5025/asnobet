let aposta = null;
let tipo = null;

function apostar(t, valor) {
  tipo = t;
  aposta = valor;
  iniciar();
}

function apostarCustom() {
  let valor = parseInt(document.getElementById("custom").value);

  if (isNaN(valor) || valor < 1 || valor > 100) {
    alert("Digite um valor entre 1 e 100");
    return;
  }

  tipo = "alto";
  aposta = valor;
  iniciar();
}

function iniciar() {
  const barra = document.getElementById("barra");
  const porcentagem = document.getElementById("porcentagem");
  const resultado = document.getElementById("resultado");

  let progresso = 0;

  resultado.innerHTML = "Carregando...";

  let intervalo = setInterval(() => {
    progresso += Math.random() * 5;
    if (progresso >= 100) progresso = 100;

    barra.style.width = progresso + "%";
    porcentagem.innerText = Math.floor(progresso) + "%";

  }, 50);

  setTimeout(() => {
    clearInterval(intervalo);

    let final = Math.floor(Math.random() * 100) + 1;

    barra.style.width = final + "%";
    porcentagem.innerText = final + "%";

    verificarResultado(final);
  }, 2000);
}

function verificarResultado(valor) {
  const resultado = document.getElementById("resultado");

  if (tipo === "baixo") {
    if (valor >= aposta && valor <= aposta + 25) {
      resultado.innerHTML = "Você ganhou ✅";
    } else {
      resultado.innerHTML = "Você perdeu ❌";
    }
  }

  if (tipo === "medio") {
    if (valor === aposta) {
      resultado.innerHTML = "ACERTO EXATO! 🎯🔥";
    } else {
      resultado.innerHTML = "Errou ❌";
    }
  }

  if (tipo === "alto") {
    let margem = 5; // tolerância
    if (valor >= aposta - margem && valor <= aposta + margem) {
      resultado.innerHTML = "Quase perfeito! 🏆";
    } else {
      resultado.innerHTML = "Você perdeu ❌";
    }
  }
}

function voltarHome() {
  window.location.href = "index.html";
}