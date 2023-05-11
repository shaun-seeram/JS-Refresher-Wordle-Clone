const wordContainers = document.querySelectorAll(".wordContainer");
const keyboardKeys = document.querySelectorAll(".key");
const letterContainers = document.querySelectorAll(".letterContainer");
const gameStatus = document.querySelector("#status");
const gameStreak = document.querySelector("#streak");
const newGame = document.querySelector("#newGame");

class Wordle {
    constructor() {
        this.word = "";
        this.wordArr = [];
        this.guessedLetters = [];
        this.round = 1;
        this.letterBox = 1;
        this.roundWord = "";
        this.state = true; // If game is currently in play
        this.status = "";
        this.controller = new AbortController();

        const initiate = async () => {
            try {
                const res = await fetch("https://random-word-api.herokuapp.com/word?number=1&length=5");
                if (res.status === 200) {
                    const jsonData = await res.json();
                    this.word = jsonData[0];
                    this.wordArr = [...jsonData[0]];
                    this.startGame();
                } else {
                    throw new Error("Status error");
                }
            } catch (e) {
                console.log("ERROR:", e);
            }
        }

        initiate();
    }

    startGame() {

        wordContainers.forEach((word) => {
            word.classList.remove("red");
        })

        keyboardKeys.forEach((key) => {
            key.classList.remove("green");
            key.classList.remove("yellow");
            key.classList.remove("gray");
        })

        letterContainers.forEach((letter) => {
            letter.textContent = "";
            letter.classList.remove("green");
            letter.classList.remove("yellow");
        })

        this.checkStatus();

        window.addEventListener("keydown", (e) => {
            let key = e.key.toLowerCase();
            if (this.state) {
                const alpha = "abcdefghijklmnopqrstuvwxyz";
    
                if (alpha.includes(key)) {
                    if (this.roundWord.length < 5) {
                        this.roundWord += key;
                        document.querySelector(`.word${this.round}`).querySelector(`.letter${this.letterBox}`).textContent = key;
                        this.letterBox = Math.min(this.letterBox + 1, 5);
                    }
                }

                if (key === "backspace") {
                    document.querySelector(`.word${this.round}`).classList.remove("red");

                    if (this.roundWord.length === 5) {
                        document.querySelector(`.word${this.round}`).querySelector(`.letter${this.letterBox}`).textContent = "";
                        this.roundWord = this.roundWord.substring(0, this.roundWord.length - 1);
                    } else if (this.roundWord.length <= 4 && this.roundWord.length > 0) {
                        this.letterBox--;
                        document.querySelector(`.word${this.round}`).querySelector(`.letter${this.letterBox}`).textContent = "";
                        this.roundWord = this.roundWord.substring(0, this.roundWord.length - 1);
                    }
                }
    
                if (key === "enter" && this.roundWord.length === 5) {
                    this.submitGuess();
                }
            } else {
                if (key === "enter") {
                    resetGame();
                }
            }
        }, { signal: this.controller.signal });
    }
    
    checkStatus() {
        if (this.roundWord === this.word) {
            this.state = false;
            this.status = "Congrats, you've won!";
            streak++;
            localStorage.setItem("streak", streak);
        } else if (this.round === 7) {
            this.state = false;
            this.status = `You lose! The word was ${this.word}`;
            streak = 0;
            localStorage.setItem("streak", 0);
        } else {
            this.status = `Guess ${this.round}`
        }

        gameStatus.textContent = this.status;
        gameStreak.textContent = streak;
    }

    async submitGuess() {
        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${this.roundWord}`);
            if (res.ok || this.roundWord === this.word) {
                [...this.roundWord].forEach((letter, i) => {
                    if (!this.guessedLetters.includes(letter)) {
                        this.guessedLetters.push(letter);
                    }
        
                    if (letter === this.wordArr[i]) {
                        document.querySelector(`button[data-key="${letter}"]`).classList.add("green");
                        document.querySelector(`.word${this.round}`).querySelector(`.letter${i+1}`).classList.add("green");
                    } else if (this.wordArr.includes(letter)) {
                        document.querySelector(`button[data-key="${letter}"]`).classList.add("yellow");
                        document.querySelector(`.word${this.round}`).querySelector(`.letter${i+1}`).classList.add("yellow");
                    } else {
                        document.querySelector(`button[data-key="${letter}"]`).classList.add("gray");
                    }
                })
                this.round++;
                this.checkStatus();
                this.letterBox = 1;
                this.roundWord = "";
            } else {
                throw new Error;
            }
        } catch (e) {
            document.querySelector(`.word${this.round}`).classList.add("red");
        }
    }
}

let streak = localStorage.getItem("streak") || 0

let game = new Wordle();

const resetGame = () => {

    if (game.round < 7 && game.state) {
        streak = 0;
        localStorage.setItem("streak", 0);
    }

    game.controller.abort();
    document.activeElement.blur();
    game = new Wordle();
}

newGame.addEventListener("click", (e) => {
    resetGame()
});

keyboardKeys.forEach((key) => {
    key.addEventListener("click", (e) => {
        e.preventDefault();
        if (key.dataset.key === "delete") {
            window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Backspace'}));
        } else if (key.dataset.key === "enter") {
            window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter'}));
        } else {
            window.dispatchEvent(new KeyboardEvent('keydown', {'key': key.dataset.key}));
        }
    })
})