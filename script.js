const bgm = document.getElementById('bgm');
const toggleBGMButton = document.getElementById('toggle-bgm');
const sfxClick = document.getElementById('sfx-click');
let isMuted = true;

const nomesBaseImagensPorDificuldade = {
    "Fácil": "facil",
    "Médio": "medio",
    "Difícil": "dificil"
};

let temaEscolhido = '';
let dificuldadeEscolhida = '';
let maxErros = 0;

let palavraSecreta = '';
let palavraDisplay = [];
let errosCometidos = 0;
const palavrasPorTema = {
    "FILMES": ["EXORCISTA", "PREMONIÇÃO", "HALLOWEEN", "INVOCAÇÃO DO MAL", "O ILUMINADO", "PSICOSE", "PÂNICO", "A HORA DO PESADELO", "O MASSACRE DA SERRA ELÉTRICA", "IT A COISA"],
    "MEDOS": ["NICHTOFOBIA", "ACROFOBIA", "ARACNOFOBIA", "AGORAFOBIA", "CLAUSTROFOBIA", "OFIDIOFOBIA"],
    "MONSTROS": ["VAMPIRO", "ZUMBI", "LOBISOMEM", "DRÁCULA", "MÚMIA", "GHOUL", "DEMÔNIO", "BRUXA", "KONG", "GODZILLA", "ALIEN"],
    "TORTURAS": ["ELETROCUTADO", "AFOGAMENTO", "QUEIMADURA", "EMPÁLAMO", "DONZELA DE FERRO", "BERÇO DE JUDAS", "AFOGAMENTO SIMULADO", "BALCÃO DE ESTIRAMENTO", "RATO", "VIOLA DAS COMADRES"]
}

//TELA E AUDIO
function toggleAudio() {
    if (bgm.paused) {
        bgm.play().then(() => {
            toggleBGMButton.textContent = '🔊';
            isMuted = false;
        }).catch(error => {
            console.error("Erro ao tentar tocar o áudio:", error);
        });
    } else {
        bgm.pause();
        toggleBGMButton.textContent = '🔇';
        isMuted = true;
    }
}

function iniciarAudioComInteracao() {
    if (bgm.paused) {
        bgm.play().then(() => {
            console.log("Música de fundo iniciada após clique do usuário.");
            bgm.muted = false;
            
            if (toggleBGMButton) {
                toggleBGMButton.textContent = '🔊';
                isMuted = false;
            }
        }).catch(error => {
            console.error("Não foi possível iniciar a música, mantendo o mudo.", error);
        });
    }
}

function playClickSound() {
    sfxClick.currentTime = 0;
    sfxClick.play().catch(error => {
        console.warn("Não foi possível tocar o SFX:", error);
    });
}

function mudarTela(idDaNovaTela) {
    playClickSound();

    const modalResultado = document.getElementById('modal-resultado');
    if (modalResultado) {
        modalResultado.style.display = 'none';
    }

    const telas = ['tela-inicial', 'tela-temas', 'tela-dificuldade', 'tela-jogo'];
    telas.forEach(id => {
        const tela = document.getElementById(id);
        if (tela) {
            tela.style.display = 'none'; 
        }
    });

    const novaTela = document.getElementById(idDaNovaTela);
    if (novaTela) {
        novaTela.style.display = 'flex'; 
    }

    if (idDaNovaTela === 'tela-temas') {
        iniciarAudioComInteracao();
    }
    if (idDaNovaTela === 'tela-jogo') {
        iniciarJogo();
    }
}


// SELEÇÕES
function selecionarTema(tema) {
    playClickSound(); 
    temaEscolhido = tema;
    console.log(`Tema escolhido: ${temaEscolhido}`); 
    mudarTela('tela-dificuldade');
}

function selecionarDificuldade(dificuldade, erros) {
    playClickSound();
    dificuldadeEscolhida = dificuldade;
    maxErros = erros;
    console.log(`Dificuldade: ${dificuldadeEscolhida}, Erros Máximos: ${maxErros}`);
    mudarTela('tela-jogo');
}


//JOGO
function iniciarJogo() {
    const telaResultado = document.getElementById('modal-resultado'); 
    if (telaResultado) {
        telaResultado.style.display = 'none';
        telaResultado.style.backgroundImage = 'none'; 
    }

    const palavrasDoTema = palavrasPorTema[temaEscolhido];

    if (palavrasDoTema && palavrasDoTema.length > 0) {
        const randomIndex = Math.floor(Math.random() * palavrasDoTema.length);
        palavraSecreta = palavrasDoTema[randomIndex].toUpperCase();
    } else {
        palavraSecreta = 'ERRO'; 
    }

    errosCometidos = 0;
    palavraDisplay = Array(palavraSecreta.length).fill('_');

    const nomeBaseImagem = nomesBaseImagensPorDificuldade[dificuldadeEscolhida];

    document.getElementById('imagem-forca').src = `STATIC/${nomeBaseImagem}_${errosCometidos}.png`;
    
    document.getElementById('tema-atual').textContent = `Tema: ${temaEscolhido}`;
    document.getElementById('tentativas-restantes').textContent = `Tentativas Restantes: ${maxErros}`;
    
    atualizarDisplayPalavra();
    gerarTeclado();
}

function atualizarDisplayPalavra() {
    document.getElementById('display-palavra').textContent = palavraDisplay.join(' ');
}

function gerarTeclado() {
    const container = document.getElementById('teclado-container');
    container.innerHTML = '';
    
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    letras.forEach(letra => {
        const button = document.createElement('button');
        button.textContent = letra;
        button.classList.add('btn-letra');
        button.onclick = () => tentarLetra(letra, button); 
        container.appendChild(button);
    }); 
}

// LÓGICA DO JOGO
function tentarLetra(letra, button) {
    playClickSound();
    button.classList.add('usada');

    let letraAcertada = false;

    for (let i = 0; i < palavraSecreta.length; i++) {
        if (palavraSecreta[i] === letra) {
            palavraDisplay[i] = letra;
            letraAcertada = true;
        }
    }
    if (letraAcertada) {
        atualizarDisplayPalavra();
        if (!palavraDisplay.includes('_')) {
            finalizarJogo(true);
        }
        
    } else {
        errosCometidos++;
        const nomeBaseImagem = nomesBaseImagensPorDificuldade[dificuldadeEscolhida];
        document.getElementById('imagem-forca').src = `STATIC/${nomeBaseImagem}_${errosCometidos}.png`;
        document.getElementById('tentativas-restantes').textContent = `Tentativas Restantes: ${maxErros - errosCometidos}`;

        if (errosCometidos >= maxErros) {
            finalizarJogo(false);
        }
    }
}

function finalizarJogo(vitoria) {
    const botoes = document.querySelectorAll('.btn-letra');
    botoes.forEach(button => {
        button.classList.add('usada');
        button.disabled = true;
    });

    const telaResultado = document.getElementById('modal-resultado');
    const palavraFinal = document.getElementById('palavra-final');
    const btnJogarNovamente = document.getElementById('btn-jogar-novamente-img');
    if (vitoria) {
        telaResultado.style.backgroundImage = "url('STATIC/VITORIA.png')";
        palavraFinal.style.color = "#00ff00";
        palavraFinal.textContent = `A palavra era: ${palavraSecreta}`;
        
    } else {
        document.getElementById('display-palavra').textContent = palavraSecreta.split('').join(' '); 
        telaResultado.style.backgroundImage = "url('STATIC/DERROTA2.png')";
        palavraFinal.style.color = "#caa1a1ff";
        palavraFinal.textContent = `A palavra era: ${palavraSecreta}`;
    }
    const DELAY_MS = 1000; 

    setTimeout(() => {
        if (telaResultado) {
            telaResultado.style.display = 'flex';
        }
        if (btnJogarNovamente) {
            btnJogarNovamente.style.display = 'block';
        }
        
    }, DELAY_MS);
}