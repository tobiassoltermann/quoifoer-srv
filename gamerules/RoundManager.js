const {
    getNullCard,
    getTeamBySeat,
} = require('./CoiffeurHelpers');

const StichManager = require('./StichManager');

class RoundManager {

    constructor(gameRules) {
        this.gR = gameRules;
        this.roundIndex = -1;
        this.roundMax = gameRules.modes.length();
    }
    
    beginRound() {
        console.log("Begin round");

        const gameState = this.gR.gameState;
        this.roundIndex++;
        gameState.status = "CHOOSE_TRICK";
        this.gR.distributeCards();
        if (this.roundIndex == 0) {
            var seatIndex = this.whoHasCard("K7");
            gameState.firstEverPlayerSeat = seatIndex;
        }
        this.startingSeat = (gameState.firstEverPlayerSeat + this.roundIndex) % this.gR.room.maxPlayers();
        this.stichMgr = new StichManager(this.gR);
        gameState.turnSeat = this.startingSeat;
        gameState.roundPlayerCanPush = true;
        gameState.lastStich = null;
        gameState.winningPlayerSeat = null;

        this.stichMgr.updatePlayedCards();

        console.log("Selecting player seat is:", gameState.turnSeat);

        this.gR.sendGameStateAll();
    }

    pushSelected() {
        console.log("RoundManager.pushSelected");
        const gameState = this.gR.gameState;
        var nextPlayerSeat = (gameState.turnSeat + 1) % this.gR.room.maxPlayers();
        
        gameState.turnSeat = nextPlayerSeat;
        if (nextPlayerSeat == this.startingSeat) {
            gameState.roundPlayerCanPush = false;
        }

        this.stichMgr.updatePlayedCards();
        this.gR.sendGameStateAll();
    }
    trickSelected(multiplier, subselection) {
        console.log("RoundManager.trickSelected", multiplier, subselection);
        const gameState = this.gR.gameState;
        this.gR.gameModeImplementation = this.gR.modes.getModeByMultiplier(multiplier);
        this.gR.gameModeImplementation.setSubselection(subselection);
        gameState.roundPlayerCanPush = false;
        gameState.status = "PLAY_ROUND";

        gameState.trickStarter = gameState.turnSeat;
        this.roundMultiplier = multiplier;
        this.stichMgr.beginStich();
        this.gR.sendGameStateAll();
    }



    playCard(card) {
        this.stichMgr.playCard(card);
        if (this.stichMgr.isEndRound()) {
            this.endRound();
        }
        this.gR.sendGameStateAll();
    }

    endRound() {
        console.log("End round");

        const calculatedScores = this.stichMgr.calculateScores();
        const startingTeam = getTeamBySeat(this.startingSeat);
        var scoresObject={
            scoreTeam1: null,
            scoreTeam2: null,

        };
        scoresObject["scoreTeam" + startingTeam] = calculatedScores["team" + startingTeam + "Score"];
        this.gR.scoresObject.updateScore(this.roundMultiplier - 1, scoresObject);

        this.gR.sendGameStateAll();
        if (this.roundIndex < this.roundMax - 1) {
            setTimeout( (() => {
                this.beginRound();
            }).bind(this), 5000);
        }
    }

    checkCanPlayCard(player, card) {
        const gameState = this.gR.gameState;
        return this.gR.gameModeImplementation.checkCanPlayCard(player, gameState.tableCardDeck, card, gameState.stichStarter);
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