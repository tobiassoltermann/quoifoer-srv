
class RoundManager {

    constructor(gameRules) {
        this.gR = gameRules;
        this.roundIndex = -1;
        this.roundMax = gameRules.modes.length();
    }

    beginRound() {
        this.roundIndex++;
        this.gR.gameState.status = "CHOOSE_TRUMP";
        this.gR.distributeCards();

        /*if (this.roundIndex == 0) {
            var seatIndex = this.whoHasCard("K7");
            this.gR.firstEverPlayerSeat = seatIndex;
        }
        this.selectingPlayerSeat = (this.gR.firstEverPlayerSeat + this.roundIndex) % this.gR.room.maxPlayers();

        console.log("Selecting player seat is:", this.selectingPlayerSeat);
        this.awaitTrickSelection();*/
    }

    setRoundTrick(trickName) {
        this.trickName = trickName;
    }

    awaitTrickSelection() {

    }

    whoHasCard(cardName) {
        const cardDecks = this.gR.gameState.playerCardDecks;
        debugger;
        for (var seatIndex = 0; seatIndex < 4; seatIndex++) {
            const currentDeck = cardDecks["player" + seatIndex];
            if (currentDeck.hasSpecificCardByName(cardName)) {
                seatIndexFound = seatIndex;
                return seatIndexFound;
            }
        }

        return -1;
    }
}

module.exports = RoundManager