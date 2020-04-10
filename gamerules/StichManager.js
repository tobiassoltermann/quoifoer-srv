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
        console.log("Begin Stich");

        const { gameState } = this.gR;
        const tcd = gameState.tableCardDeck;
        gameState.lastStich = Object.assign(
            {},
            gameState.tableCardDeck,
            {
                winningPlayerSeat: gameState.winningPlayerSeat
            },
        );

        gameState.stichStarter = gameState.turnSeat;
        gameState.status = "PLAY_ROUND";
        this.playedCards = [];
        gameState.winningPlayerSeat = null;
        this.updatePlayedCards();

        this.gR.sendGameStateAll();
    }

    endStich() {
        console.log("End stich");
        const gameState = this.gR.gameState;
        
        const {
            winningPlayerSeat,
            winningTeam,
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
        gameState.winningPlayerSeat = winningPlayerSeat;
        gameState.status = "AWAIT_ENDROUND";
        gameState.turnSeat = winningPlayerSeat;
        this.gR.sendGameStateAll();
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
                setTimeout( (() => {
                    this.beginStich();
                }).bind(this), 3000);
            }
        } else {
            var nextPlayerSeat = (gameState.turnSeat + 1) % this.gR.room.maxPlayers();
            gameState.turnSeat = nextPlayerSeat;
            tcd["player" + gameState.turnSeat] = getNullCard();
        }
    }

    updatePlayedCards() {
        const gameState = this.gR.gameState;
        const tcd = gameState.tableCardDeck;
        tcd.player0 = null;
        tcd.player1 = null;
        tcd.player2 = null;
        tcd.player3 = null;
        tcd["player" + gameState.turnSeat] = getNullCard();
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

        // Last Stich +5pts
        this.stiche.forEach( (stich) => {
            team1Score += stich.team1Score;
            team2Score += stich.team2Score;
        });

        // Match bonus +100pts
        if (team1Score == 157) {
            team1Score += 100;
        }
        if (team2Score == 157) {
            team2Score += 100;
        }
        switch (this.crtStich.winningPlayerSeat) {
            case 0:
            case 2:
                team1Score += lastStichValue;
                break;
            case 1:
            case 3:
                team2Score += lastStichValue;
                break;
            default:
                console.warn("Should not happen. StichManager.calculateScores(), winningPlayerSeat has different value:", this.crtStich.winningPlayerSeat);
        }
        return {
            team1Score,
            team2Score
        };
    }
}


module.exports = StichManager;