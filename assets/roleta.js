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

function girar() {
  const faixa = document.getElementById("faixa");

  // reset
  faixa.style.transition = "none";
  faixa.style.transform = "translateX(0)";
  faixa.innerHTML = "";

  let sequencia = [];

  // cria sequência
  for (let i = 0; i < 20; i++) {
    sequencia.push(gerarCor());
  }

  // renderiza
  sequencia.forEach(cor => {
    let img = document.createElement("img");

    if (cor === "vermelho") img.src = "../assets/img/v.png";
    if (cor === "azul") img.src = "../assets/img/a.png";
    if (cor === "dourado") img.src = "../assets/img/d.png";

    img.dataset.cor = cor; // 🔥 IMPORTANTE

    faixa.appendChild(img);
  });

  faixa.offsetHeight;

  faixa.style.transition = "transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)";

  let larguraItem = 100;
  let centroJanela = 150;

  let posicaoFinal = 10;

  let deslocamento =
    (posicaoFinal * larguraItem) - centroJanela;

  faixa.style.transform = `translateX(-${deslocamento}px)`;

  // 🔥 AGORA PEGAMOS O RESULTADO REAL
  setTimeout(() => {
    pegarResultadoReal();
  }, 4000);
}

function pegarResultadoReal() {
  const faixa = document.getElementById("faixa");
  const janela = document.querySelector(".janela");
  const imagens = faixa.querySelectorAll("img");

  let rectJanela = janela.getBoundingClientRect();
let centroJanela = rectJanela.left + (rectJanela.width / 2);

  let resultadoReal = null;

  imagens.forEach(img => {
    let rect = img.getBoundingClientRect();
    let meioImg = rect.left + (rect.width / 2);

    let distancia = Math.abs(centroJanela - meioImg);

    // pega a imagem mais próxima do centro
    if (!resultadoReal || distancia < resultadoReal.distancia) {
      resultadoReal = {
        cor: img.dataset.cor,
        distancia: distancia
      };
    }
  });

  mostrarResultado(resultadoReal.cor);
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
