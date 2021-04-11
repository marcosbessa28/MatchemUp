class AudioController {
    constructor() {
        this.bgMusic = new Audio('Assets/Audio/creepy.mp3');
        this.flipSound = new Audio('Assets/Audio/flip.wav');
        this.matchSound = new Audio('Assets/Audio/match.wav');
        this.victorySound = new Audio('Assets/Audio/victory.wav');
        this.gameOverSound = new Audio('Assets/Audio/gameOver.wav');
        this.bgMusic.volume = 0.5;
        this.bgMusic.loop = true;
    }
    startMusic() {
        /* this.bgMusic.play(); */
    }
    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
    flip() {
        this.flipSound.play();
    }
    match() {
        this.matchSound.play();
    }
    victory() {
        this.stopMusic();
        this.victorySound.play();
    }
    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }
}

class MatchemUp {
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById('time-remaining');
        this.ticker = document.getElementById('flips');
        this.points = document.getElementById('points');
        this.countDownText = document.getElementById('countdown-text');
        this.audioController = new AudioController();
    }
    startGame() {
        this.cardToCheck = null;
        this.totalClicks = 0;
        this.timeRemaining = this.totalTime;
        this.matchedCards = [];
        this.busy = true;
        this.shuffleCards();
        this.hideCards();
        this.showCards();
        
        this.countDownText.classList.add("visible");
        setTimeout(() => {
            this.countDownText.classList.remove("visible");
            setTimeout(() => {
                this.countDownText.innerText = "2";
                this.countDownText.classList.add("visible");
                setTimeout(() => {
                    this.countDownText.classList.remove("visible");
                    setTimeout(() => {
                        this.countDownText.innerText = "1";
                        this.countDownText.classList.add("visible");
                        setTimeout(() => {
                            this.hideCards();
                            this.audioController.startMusic();
                            this.countDown = this.startCountDown();
                            this.busy = false;
                            this.countDownText.classList.remove("visible");
                        }, 1000);
                    }, 100);
                }, 900);
            }, 100);
        }, 900);

        this.updateTimer();
        this.ticker.innerText = this.totalClicks;
    }
    hideCards() {
        this.cardsArray.forEach(card => {
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }
    showCards() {
        this.cardsArray.forEach(card => {
            card.classList.add('visible');
        });
    }
    flipCard(card) {
        if(this.canFlipCard(card)) {
            this.audioController.flip();
            this.totalClicks++;
            this.ticker.innerText = this.totalClicks;
            card.classList.add('visible');

            if(this.cardToCheck)
                this.checkForCardMatch(card);
            else
                this.cardToCheck = card;
        }
    }
    checkForCardMatch(card) {
        if(this.getCardType(card) === this.getCardType(this.cardToCheck))
            this.cardMatch(card, this.cardToCheck);
        else
            this.cardMisMatch(card, this.cardToCheck);
        
        this.cardToCheck = null;
    }
    cardMatch(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        
        setTimeout(() => {
            this.audioController.match();
            if(this.matchedCards.length === this.cardsArray.length)
                this.victory();
        }, 500);
    }
    cardMisMatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }
    getCardType(card) {
        return card.getElementsByClassName('card-value')[0].src;
    }
    startCountDown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.updateTimer();
            if(this.timeRemaining === 0)
                this.gameOver();
        }, 1000);
    }
    updateTimer() {
        this.timer.innerText = formatTime(this.timeRemaining, false);
    }
    gameOver() {
        clearInterval(this.countDown);
        this.audioController.gameOver();
        document.getElementById('game-over-text').classList.add('visible');
    }
    victory() {
        clearInterval(this.countDown);
        this.audioController.victory();
        this.points.innerText = Math.floor( (this.timeRemaining / this.totalTime + 18 / this.totalClicks) * Math.PI * 10000 );
        document.getElementById('victory-text').classList.add('visible');
    }
    shuffleCards() {
        for(let i = this.cardsArray.length - 1; i > 0; i--) {
            let randIndex = Math.floor(Math.random() * (i+1));
            this.cardsArray[randIndex].style.order = i;
            this.cardsArray[i].style.order = randIndex;
        }
    }

    canFlipCard(card) {
        return (!this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck);
    }
}

function dataURItoBlob(dataURI, mime) {
    var byteString = window.atob(dataURI);
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
    }
   var blob = new Blob([ia], { type: mime });
   return blob;
}

function ready() {
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = Array.from(document.getElementsByClassName('card'));
    let game = new MatchemUp(100, cards);

    // Get the name of the collection from the URL. Example: ...index.html?collection=Avengers1
    let indexArray = [1,2,3,4,5,6,7,8,9];
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let collection = urlParams.get('collection');
    if( collection == null )
        collection = "TM-Avengers";
    let size = urlParams.get('size');
    if( size != null ) {
        let totalIndexArray = getIntArraySuffled(size);
        indexArray = totalIndexArray.slice(0,10);
    }

    // Load images onto the cards
    let cardValues = Array.from(document.getElementsByClassName('card-value'));
    let i=0;
    let copy = false;
    cardValues.forEach(cardValues => {
        index = indexArray[i];
        indexTxt = index < 10 ? '0'+index : index;
        cardValues.src = `Assets/Collections/${collection}/${indexTxt}.png`;
        if( copy ) {
            copy = false;
            i++;
        }
        else
            copy = true;
    });

    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            game.startGame();
        })
    });

    cards.forEach(card => {
        card.addEventListener('click', () => {
            game.flipCard(card);
        });
    });
}

function getIntArraySuffled(length) {
    let array = generateIntArray(length);
    return shuffleArray(array);
}

function generateIntArray(length) {
    let array = Array(length);
    for(let i=0; i<length; i++) {
        array[i] = i+1;
    }
    return array;
}

function shuffleArray(numArray)
{
    for(let i = numArray.length - 1; i > 0; i--) {
        let randIndex = Math.floor(Math.random() * (i+1));
        let tmp = numArray[i];
        numArray[i] = numArray[randIndex];
        numArray[randIndex] = tmp;
    }
    return numArray;
}

function formatTime(totalSeconds, incHours) {
    if(incHours) {
        hours = Math.floor(totalSeconds / 3600);
        if (hours < 10) { hours = "0" + hours; }
        hours = hours + ":";
    }
    else
        hours = "";

    totalSeconds %= 3600;
    minutes = Math.floor(totalSeconds / 60);
    seconds = totalSeconds % 60;
    
    if(minutes < 10) { minutes = "0" + minutes; }
    if(seconds < 10) { seconds = "0" + seconds; }
    return hours + minutes + ":" + seconds;
}

if(document.readyState --- 'loading') {
    document.addEventListener('DOMContentLoader', ready());
} else {
    ready();
}
