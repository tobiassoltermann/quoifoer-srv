
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
        

        console.log("Selecting player seat is:", gameState.turnSeat);
    }

    trickSelected(multiplier) {
        const gameState = this.gR.gameState;
        console.log("RoundManager.trickSelected", multiplier);
        this.gameModeImplementation = this.gR.modes.getModeByMultiplier(multiplier);
        gameState.roundPlayerCanPush = false;
        gameState.status = "PLAY_ROUND";
        gameState.trickStarter = gameState.turnSeat;
    }

    pushSelected() {
        console.log("RoundManager.pushSelected");
        const gameState = this.gR.gameState;
        var nextPlayerSeat = (gameState.turnSeat + 1) % this.gR.room.maxPlayers();
        gameState.turnSeat = nextPlayerSeat;
        if (nextPlayerSeat == this.startingSeat) {
            gameState.roundPlayerCanPush = false;
        }
    }

    playCard() {

    }

    checkCanPlayCard(player, card) {
        return card.getRace() == this.gameModeImplementation.checkCanPlayCard(player, card);
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