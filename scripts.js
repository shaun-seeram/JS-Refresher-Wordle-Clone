class Wordle {
    constructor() {
        this.word = "";
        this.wordArr = [];
        this.guessedLetters = [];
        this.round = 1;
        this.letterBox = 1;
        this.roundWord = "";
        this.status = "Playing";
        this.controller = new AbortController();

        try {
            fetch("https://random-word-api.herokuapp.com/word?number=1&length=5").then(d => d.json()).then((jsonData) => {
                this.word = jsonData[0];
                this.wordArr = [...jsonData[0]];
                this.startGame();
            })
        } catch (e) {
            console.log(e);
        }
    }

    checkStatus() {
        if (this.roundWord === this.word) {
            this.status = "Congrats, you've won!";
        } else if (this.round === 6) {
            this.status = `You lose! The word was ${this.word}`;
        }

        gameStatus.textContent = this.status;
    }

    startGame() {

        document.querySelectorAll(".letterContainer").forEach((letter) => {
            letter.textContent = "";
            letter.classList.remove("green");
            letter.classList.remove("yellow");
        })

        this.checkStatus();
        window.addEventListener("keypress", (e) => {
            if (this.status === "Playing") {
                const alpha = "abcdefghijklmnopqrstuvwxyz";
                let key = e.key.toLowerCase();
    
                if (alpha.includes(key)) {
                    if (this.roundWord.length < 5) {
                        this.roundWord += key;
                        document.querySelector(`.word${this.round}`).querySelector(`.letter${this.letterBox}`).textContent = key;
                        this.letterBox++
                    }
                }
    
                if (e.key === "Enter" && this.roundWord.length === 5) {
                    this.submitGuess();
                }
            }
        }, { signal: this.controller.signal });
    }

    submitGuess() {
        [...this.roundWord].forEach((letter, i) => {
            if (!this.guessedLetters.includes(letter)) {
                this.guessedLetters.push(letter);
            }

            if (letter === this.wordArr[i]) {
                document.querySelector(`.word${this.round}`).querySelector(`.letter${i+1}`).classList.add("green");
            } else if (this.wordArr.includes(letter)) {
                document.querySelector(`.word${this.round}`).querySelector(`.letter${i+1}`).classList.add("yellow");
            }

        })

        this.checkStatus();

        this.round++;
        this.letterBox = 1;
        this.roundWord = "";
    }

}

const gameStatus = document.querySelector("#status");

let game = new Wordle();

const resetGame = () => {
    game.controller.abort();
    document.activeElement.blur();
    game = new Wordle();
}

document.querySelector("#newGame").addEventListener("click", (e) => {
    resetGame()
});

// Deal with Backspace?
// Verify words
// Add localstorage
// Style