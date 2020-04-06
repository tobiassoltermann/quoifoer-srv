const {
    getSeatOrderMechanism,
    AbsoluteSeatOrder,
    RelativeSeatOrder,
    getCompassBySeat,
    getNullCard,
} = require('./CoiffeurHelpers');
class RoundManager {

    constructor(gameRules) {
        this.gR = gameRules;
        this.roundIndex = -1;
        this.roundMax = gameRules.modes.length();
    }

    beginRound() {
        const gameState = this.gR.gameState;
        this.roundIndex++;
        gameState.status = "CHOOSE_TRICK";
        this.gR.distributeCards();
        if (this.roundIndex == 0) {
            var seatIndex = this.whoHasCard("K7");
            gameState.firstEverPlayerSeat = seatIndex;
        }
        this.startingSeat = (gameState.firstEverPlayerSeat + this.roundIndex) % this.gR.room.maxPlayers();
        gameState.turnSeat = this.startingSeat;
        gameState.roundPlayerCanPush = true;

        this.updatePlayedCards();

        console.log("Selecting player seat is:", gameState.turnSeat);
    }

    pushSelected() {
        console.log("RoundManager.pushSelected");
        const gameState = this.gR.gameState;
        var nextPlayerSeat = (gameState.turnSeat + 1) % this.gR.room.maxPlayers();
        
        gameState.turnSeat = nextPlayerSeat;
        if (nextPlayerSeat == this.startingSeat) {
            gameState.roundPlayerCanPush = false;
        }

        this.updatePlayedCards();
    }
    trickSelected(multiplier) {
        const gameState = this.gR.gameState;
        console.log("RoundManager.trickSelected", multiplier);
        this.gameModeImplementation = this.gR.modes.getModeByMultiplier(multiplier);
        gameState.roundPlayerCanPush = false;
        gameState.status = "PLAY_ROUND";
        gameState.trickStarter = gameState.turnSeat;
        this.playedCards = [];
    }

    updatePlayedCards() {
        const gameState = this.gR.gameState;
        const tcd = gameState.tableCardDeck;
        tcd.S.card = null;
        tcd.E.card = null;
        tcd.N.card = null;
        tcd.W.card = null;
        tcd[getCompassBySeat(gameState.turnSeat)].card = getNullCard();
    }

    playCard(card) {
        const gameState = this.gR.gameState;
        const cardDecks = gameState.playerCardDecks;
        const tcd = gameState.tableCardDeck;

        const currentPlayerCarddeck = cardDecks["player" + gameState.turnSeat];
        currentPlayerCarddeck.removeCard(card);
        tcd[getCompassBySeat(gameState.turnSeat)].card = card;

        const playedCards = Object
            .values(gameState.tableCardDeck)
            .filter( (deckObj) => { return deckObj.card != null && deckObj.card.name != "NN" } )
            
        if (playedCards.length >= 4 ) {
            this.endStich(playedCards);
        } else {
            var nextPlayerSeat = (gameState.turnSeat + 1) % this.gR.room.maxPlayers();
            gameState.turnSeat = nextPlayerSeat;
            tcd[getCompassBySeat(gameState.turnSeat)].card = getNullCard();
        }
    }

    endStich() {
        const gameState = this.gR.gameState;
        console.log("End stich");

        const winningSeat = this.gameModeImplementation.checkWinner(gameState.tableCardDeck, gameState.trickStarter);
        console.log("winningSeat:", winningSeat);
        // TOD: create new round
    }
    endRound() {
        console.log("End round");
    }


    checkCanPlayCard(player, card) {
        const gameState = this.gR.gameState;

        return this.gameModeImplementation.checkCanPlayCard(gameState.tableCardDeck, player, card);
    }

    whoHasCard(cardName) {
        const gameState = this.gR.gameState;
        const cardDecks = gameState.playerCardDecks;
        var seatIndexFound = -1;
        for (var seatIndex = 0; seatIndex < 4; seatIndex++) {
            const currentDeck = cardDecks["player" + seatIndex];
            if (currentDeck.hasSpecificCardByName(cardName)) {
                seatIndexFound = seatIndex;
                return seatIndexFound;
            }
        }

        return seatIndexFound;
    }
}

module.exports = RoundManager