let escolhaUsuario = null;

function apostar(cor) {
  escolhaUsuario = cor;
  girar();
}

function gerarCor() {
  let chance = Math.random();

  if (chance < 0.45) return "vermelho";
  if (chance < 0.90) return "azul";
  return "dourado";
}

function criarSequencia(resultadoFinal) {
  let faixa = [];

  for (let i = 0; i < 30; i++) {
    faixa.push(gerarCor());
  }

  // garante que o resultado final fique no centro
  faixa.push(resultadoFinal);

  return faixa;
}

function girar() {
  const faixaDiv = document.getElementById("faixa");
  const resultadoTexto = document.getElementById("resultado");

  faixaDiv.innerHTML = "";

  let resultado = gerarCor();
  let sequencia = criarSequencia(resultado);

  // cria imagens
  sequencia.forEach(cor => {
    let img = document.createElement("img");

    if (cor === "vermelho") img.src = "img/v.png";
    if (cor === "azul") img.src = "img/a.png";
    if (cor === "dourado") img.src = "img/d.png";

    faixaDiv.appendChild(img);
  });

  // animação
  let deslocamento = (sequencia.length - 3) * 100; 
  faixaDiv.style.transform = `translateX(-${deslocamento}px)`;

  setTimeout(() => {
    mostrarResultado(resultado);
  }, 4000);
}

function mostrarResultado(resultado) {
  const texto = document.getElementById("resultado");

  if (resultado === escolhaUsuario) {
    texto.innerHTML = `Resultado: ${resultado.toUpperCase()} — Você ganhou 🎉`;
  } else {
    texto.innerHTML = `Resultado: ${resultado.toUpperCase()} — Você perdeu ❌`;
  }
}

function voltarHome() {
  window.location.href = "index.html";
}