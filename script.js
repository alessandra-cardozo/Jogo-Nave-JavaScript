 // Obter elementos do DOM para uso no jogo
const tela = document.getElementById('tela-jogo');
const contexto = tela.getContext('2d');
const elementoPontuacao = document.getElementById('pontuacao');
const seletorDificuldade = document.getElementById('nivel-dificuldade');

// Dimensões e configurações iniciais do jogo
const LARGURA_JOGADOR = 40;
const ALTURA_JOGADOR = 40;
const LARGURA_INIMIGO = 40;
const ALTURA_INIMIGO = 40;

// Configuração de dificuldades
const dificuldades = {
  facil: { velocidadeInimigo: 1.5, intervaloTiro: 100, velocidadeJogador: 6 },
  intermediario: { velocidadeInimigo: 2.5, intervaloTiro: 70, velocidadeJogador: 5 },
  dificil: { velocidadeInimigo: 4, intervaloTiro: 50, velocidadeJogador: 4 }
};

// Estado inicial do jogo
const jogo = {
  jogador: {
    x: tela.width / 2 - LARGURA_JOGADOR / 2,
    y: tela.height - ALTURA_JOGADOR - 10,
    velocidade: dificuldades.facil.velocidadeJogador,
    tiros: [],
    pontuacao: 0
  },
  inimigos: [],
  tirosInimigos: [],
  teclas: {},
  gameOver: false,
  dificuldadeAtual: 'facil'
};

// Classe para gerenciar tiros
class Tiro {
  constructor(x, y, ehInimigo = false) {
    this.x = x;
    this.y = y;
    this.largura = 5;
    this.altura = 10;
    this.velocidade = ehInimigo ? 4 : -7;
    this.ehInimigo = ehInimigo;
  }

  desenhar() {
    contexto.fillStyle = this.ehInimigo ? 'red' : 'white';
    contexto.fillRect(this.x, this.y, this.largura, this.altura);
  }

  mover() {
    this.y += this.velocidade;
  }
}

// Classe para gerenciar os inimigos
class Inimigo {
  constructor() {
    this.x = Math.random() * (tela.width - LARGURA_INIMIGO);
    this.y = 0;
    this.velocidade = dificuldades[jogo.dificuldadeAtual].velocidadeInimigo;
    this.intervaloTiro = dificuldades[jogo.dificuldadeAtual].intervaloTiro;
    this.contadorTiro = 0;
  }

  desenhar() {
    contexto.fillStyle = 'red';
    contexto.fillRect(this.x, this.y, LARGURA_INIMIGO, ALTURA_INIMIGO);
  }

  mover() {
    this.y += this.velocidade;
    this.contadorTiro++;
    if (this.contadorTiro >= this.intervaloTiro) {
      this.atirar();
      this.contadorTiro = 0;
    }
  }

  atirar() {
    jogo.tirosInimigos.push(new Tiro(this.x + LARGURA_INIMIGO / 2, this.y + ALTURA_INIMIGO, true));
  }
}

// Função para desenhar o jogador
function desenharJogador() {
  contexto.fillStyle = 'blue';
  contexto.fillRect(jogo.jogador.x, jogo.jogador.y, LARGURA_JOGADOR, ALTURA_JOGADOR);
}

// Move o jogador
function moverJogador() {
  if (jogo.gameOver) return;

  if ((jogo.teclas['ArrowLeft'] || jogo.teclas['a']) && jogo.jogador.x > 0) {
    jogo.jogador.x -= jogo.jogador.velocidade;
  }
  if ((jogo.teclas['ArrowRight'] || jogo.teclas['d']) && jogo.jogador.x < tela.width - LARGURA_JOGADOR) {
    jogo.jogador.x += jogo.jogador.velocidade;
  }
}

// O jogador atira
function atirar() {
  if (!jogo.gameOver) {
    jogo.jogador.tiros.push(new Tiro(jogo.jogador.x + LARGURA_JOGADOR / 2, jogo.jogador.y));
  }
}

// Atualiza tiros
function atualizarTiros() {
  jogo.jogador.tiros = jogo.jogador.tiros.filter(tiro => {
    tiro.mover();
    return tiro.y > 0;
  });

  jogo.tirosInimigos = jogo.tirosInimigos.filter(tiro => {
    tiro.mover();
    if (verificarColisao(tiro, jogo.jogador)) {
      jogo.gameOver = true;
    }
    return tiro.y < tela.height;
  });
}

// Verifica colisão
function verificarColisao(obj1, obj2) {
  return obj1.x < obj2.x + LARGURA_JOGADOR &&
         obj1.x + obj1.largura > obj2.x &&
         obj1.y < obj2.y + ALTURA_JOGADOR &&
         obj1.y + obj1.altura > obj2.y;
}

// Atualiza inimigos
function atualizarInimigos() {
  if (!jogo.gameOver && Math.random() < 0.02) {
    jogo.inimigos.push(new Inimigo());
  }

  jogo.inimigos = jogo.inimigos.filter(inimigo => {
    inimigo.mover();
    return inimigo.y <= tela.height;
  });
}

// Desenha na tela
function desenhar() {
  contexto.clearRect(0, 0, tela.width, tela.height);
  desenharJogador();
  jogo.jogador.tiros.forEach(tiro => tiro.desenhar());
  jogo.inimigos.forEach(inimigo => inimigo.desenhar());
  jogo.tirosInimigos.forEach(tiro => tiro.desenhar());

  if (jogo.gameOver) {
    contexto.fillStyle = 'rgba(0, 0, 0, 0.5)';
    contexto.fillRect(0, 0, tela.width, tela.height);
    contexto.fillStyle = 'red';
    contexto.font = '48px Arial';
    contexto.textAlign = 'center';
    contexto.fillText('GAME OVER', tela.width / 2, tela.height / 2);
  }
}

// Loop principal
function loopJogo() {
  moverJogador();
  atualizarTiros();
  atualizarInimigos();
  desenhar();
  requestAnimationFrame(loopJogo);
}

// Função para atualizar a dificuldade
function atualizarDificuldade() {
  jogo.dificuldadeAtual = seletorDificuldade.value;
  jogo.jogador.velocidade = dificuldades[jogo.dificuldadeAtual].velocidadeJogador;
}

// Adiciona evento para mudar dificuldade
seletorDificuldade.addEventListener('change', atualizarDificuldade);

// Reinicia o jogo
function reiniciarJogo() {
  jogo.jogador.x = tela.width / 2 - LARGURA_JOGADOR / 2;
  jogo.jogador.y = tela.height - ALTURA_JOGADOR - 10;
  jogo.jogador.tiros = [];
  jogo.inimigos = [];
  jogo.tirosInimigos = [];
  jogo.jogador.pontuacao = 0;
  elementoPontuacao.textContent = 'Pontuação: 0';
  jogo.gameOver = false;
}

// Eventos do teclado
window.addEventListener('keydown', (evento) => {
  jogo.teclas[evento.key] = true;
  if (evento.key === 'Enter' && jogo.gameOver) reiniciarJogo();
  if (evento.key === ' ' && !jogo.gameOver) atirar();
});

window.addEventListener('keyup', (evento) => {
  jogo.teclas[evento.key] = false;
});

// Inicia o jogo
loopJogo();
