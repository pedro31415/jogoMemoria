document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const timerLabel = document.getElementById("timer");
    const cardValues = ["A", "A", "B", "B", "C", "C", "D", "D", "E", "E", "F", "F", "G", "G", "H", "H", "I", "I", "J", "J"];
    const shuffledValues = shuffleArray([...cardValues]); // Shuffle the card values
    let firstSelected = null;
    let moveCount = 0;
    let gameTimer;
    const GAME_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Create the game board
    shuffledValues.forEach(value => {
        const card = document.createElement("div");
        card.className = "card";
        card.addEventListener("click", () => handleCardClick(card, value));
        board.appendChild(card);
    });

    // Start the timer
    const startTime = Date.now();
    gameTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = GAME_DURATION - elapsed;

        if (remaining <= 0) {
            clearInterval(gameTimer);
            timerLabel.textContent = "00:00";
            gameOver();
        } else {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            timerLabel.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }, 1000);

    function handleCardClick(card, value) {
        if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

        card.textContent = value;
        card.classList.add("flipped");

        if (!firstSelected) {
            firstSelected = card;
        } else {
            moveCount++;
            if (firstSelected.textContent === value) {
                firstSelected.classList.add("matched");
                card.classList.add("matched");
                firstSelected = null;
            } else {
                setTimeout(() => {
                    firstSelected.classList.remove("flipped");
                    firstSelected.textContent = "";
                    card.classList.remove("flipped");
                    card.textContent = "";
                    firstSelected = null;
                }, 750);
            }
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Função para buscar pontuações do back-end
    function loadScores() {
        fetch("/scores")
            .then((response) => response.json())
            .then((scores) => {
                const scoreList = document.getElementById("score-list");
                scoreList.innerHTML = ""; // Limpa o conteúdo anterior
                scores.forEach((score) => {
                    const listItem = document.createElement("li");
                    listItem.textContent = `${score.player}: ${score.score} movimentos em ${score.datetime}`;
                    scoreList.appendChild(listItem);
                });
            })
            .catch((error) => {
                console.error("Erro ao carregar pontuações:", error);
            });
    }

    // Carregar as pontuações ao carregar a página
    loadScores();

    function gameOver() {
        alert(`Tempo esgotado! Você fez ${moveCount} movimentos.`);
    
        const scoreData = {
            player: "Nome do Jogador",
            score: moveCount,
            datetime: new Date().toISOString(),
        };
    
        // Enviar os dados da pontuação para o servidor usando Fetch
        fetch("/save-score", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(scoreData),
        })
            .then((response) => {
                if (response.ok) {
                    console.log("Pontuação salva com sucesso");
                } else {
                    console.error("Erro ao salvar pontuação");
                }
            })
            .catch((error) => {
                console.error("Erro ao enviar a solicitação:", error);
            });
    
        board.innerHTML = "";
    }

});



// function gameOver() {
//     alert(`Tempo esgotado! Você fez ${moveCount} movimentos.`);
//     board.innerHTML = "";
// }


