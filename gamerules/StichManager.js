const {
    getCompassBySeat,
    getNullCard,
} = require('./CoiffeurHelpers');



class StichManager {
    constructor(gameRules) {
        this.gR = gameRules;
        this.maxStiche = 9;
        this.stiche = [];
        this.crtStich;
        this.scores = {
            team1: [],
            team2: []
        }
    }

    beginStich() {
        const { gameState } = this.gR;
        const tcd = gameState.tableCardDeck;

        gameState.stichStarter = gameState.turnSeat;
        this.playedCards = [];
    }

    endStich() {
        const gameState = this.gR.gameState;
        console.log("End stich");
        
        const {
            winningPlayerSeat,
            team1Score,
            team2Score,
        } = this.gR.gameModeImplementation.checkWinner(gameState.tableCardDeck, gameState.stichStarter);

        this.crtStich = Object.assign(
            {},
            gameState.tableCardDeck,
            {
                winningPlayerSeat,
                team1Score,
                team2Score,
            });

        this.stiche.push(this.crtStich);
        
        console.log("winningSeat:", winningPlayerSeat);
        gameState.turnSeat = winningPlayerSeat;
    }

    playCard(card) {
        const gameState = this.gR.gameState;
        const cardDecks = gameState.playerCardDecks;
        const tcd = gameState.tableCardDeck;

        const currentPlayerCarddeck = cardDecks["player" + gameState.turnSeat];
        currentPlayerCarddeck.removeCard(card);
        tcd["player" + gameState.turnSeat] = card;


        const playedCards = Object
            .values(gameState.tableCardDeck)
            .filter( (deckObj) => { return deckObj != null && deckObj.name != "NN" } )
            
        if (playedCards.length >= 4 ) {
            this.endStich(playedCards);
            if (!this.isEndRound()) {
                this.beginStich();
            }

        } else {
            var nextPlayerSeat = (gameState.turnSeat + 1) % this.gR.room.maxPlayers();
            gameState.turnSeat = nextPlayerSeat;
            tcd["player" + gameState.turnSeat] = getNullCard();
        }
    }

    remainingStiche() {
        return this.maxStiche - this.stiche.length;
    }

    isEndRound() {
        return this.stiche.length >= this.maxStiche;
    }

    calculateScores() {
        const lastStichValue = 5;
        var team1Score = 0;
        var team2Score = 0;
        this.stiche.forEach( (stich) => {
            team1Score += stich.team1Score;
            team2Score += stich.team2Score;
        })
        switch (this.crtStich.winningSeat) {
            case 0:
            case 2:
                team1Score += lastStichValue;
                break;
            case 1:
            case 3:
                team2Score += lastStichValue;
                break;
            default:
                console.warn("Should not happen");
                debugger;
        }
        return {
            team1Score,
            team2Score
        };
    }
}


module.exports = StichManager;