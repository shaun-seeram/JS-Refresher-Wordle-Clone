class Wordle {
    constructor() {
        this.word = "";
        this.wordArr = [];
        this.guessedLetters = [];
        this.round = 1;
        this.letterBox = 1;
        this.roundWord = "";
        this.state = true;
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
                    throw new Error("Status error")
                }
            } catch (e) {
                console.log("ERROR:", e)
            }
        }

        initiate();
    }

    checkStatus() {
        if (this.roundWord === this.word) {
            this.state = false;
            this.status = "Congrats, you've won!";
        } else if (this.round === 7) {
            this.state = false;
            this.status = `You lose! The word was ${this.word}`;
        } else {
            this.status = `Guess ${this.round}`
        }

        gameStatus.textContent = this.status;
    }

    startGame() {

        document.querySelectorAll(".wordContainer").forEach((word) => {
            word.classList.remove("red");
        })

        document.querySelectorAll(".key").forEach((key) => {
            key.classList.remove("green");
            key.classList.remove("yellow");
            key.classList.remove("gray");
        })

        document.querySelectorAll(".letterContainer").forEach((letter) => {
            letter.textContent = "";
            letter.classList.remove("green");
            letter.classList.remove("yellow");
        })

        this.checkStatus();

        window.addEventListener("keydown", (e) => {
            if (this.state) {
                const alpha = "abcdefghijklmnopqrstuvwxyz";
                let key = e.key.toLowerCase();
    
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
            }
        }, { signal: this.controller.signal });
    }

    submitGuess() {
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${this.roundWord}`).then(res => res.json()).then((jsonRes) => {
            if (jsonRes[0]?.word || this.roundWord === this.word) {
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
                document.querySelector(`.word${this.round}`).classList.add("red");
            }
        });
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

document.querySelectorAll(".key").forEach((key) => {
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

// Add localstorage
// Add leaderboard?
// Qwordle
