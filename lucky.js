let cartaEscolhida = null;

const container = document.getElementById("cartas");

// gerar cartas automaticamente
for (let i = 1; i <= 10; i++) {
  let img = document.createElement("img");
  img.src = `img/${i}.png`; // pasta das imagens
  img.classList.add("carta");

  img.onclick = () => selecionarCarta(i, img);

  container.appendChild(img);
}

function selecionarCarta(valor, elemento) {
  cartaEscolhida = valor;

  // remove seleção anterior
  document.querySelectorAll(".carta").forEach(c => {
    c.classList.remove("selecionada");
  });

  elemento.classList.add("selecionada");
}

function sortear() {
  const resultadoTexto = document.getElementById("resultado");

  if (!cartaEscolhida) {
    resultadoTexto.innerHTML = "Escolha uma carta primeiro!";
    return;
  }

  let sorteada = Math.floor(Math.random() * 10) + 1;

  if (sorteada === cartaEscolhida) {
    resultadoTexto.innerHTML = `🎉 Carta sorteada: ${sorteada} — VOCÊ GANHOU!`;
  } else {
    resultadoTexto.innerHTML = `Carta sorteada: ${sorteada} — Você perdeu ❌`;
  }
}

// botão voltar
function voltarHome() {
  window.location.href = "index.html";
}