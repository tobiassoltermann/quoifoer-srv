const Mode = require('./Mode');
const {
    arrayRotate,
    AbsoluteSeatNumbers,
} = require('../CoiffeurHelpers');

const {
    ModesDirectional,
} = require('./ModesDirectional');

class ModeTannenbaum extends ModesDirectional {
    constructor(multiplier) {
        super("TANNENBAUM", multiplier, "trumpT");
        this.regularOrder = ["X", ["9", "J"], ["8", "Q"], ["7", "K"], ["6", "A"]];
    }

    levelMappingFunction(race, level) {
        if (typeof(level) === "string" ) {
            return race + level
        }
        if (level instanceof Array) {
            return level.map( (e) => { return this.levelMappingFunction(race, e) } );
        }
    }

    createRemainingRaceCardlist(onCards, onRace) {
        var remainingRaces = ['H', 'S', 'K', 'C'].filter((crt) => {
            return (crt != onRace);
        });


        var remainingCards = [];
        remainingRaces.forEach((race) => {
            remainingCards.push(...this.regularOrder.map( (level) => {
                return this.levelMappingFunction(race, level)
            }));
        })
        return [].concat(onCards, remainingCards);
    }

    compareCards(orderedCardNames, card1, card2) {
        function findCardNameDeep (cardA, cardB) {
            if (typeof(cardA) === "string" ) {
                return cardA == cardB;
            }
            if (cardA instanceof Array) {
                return cardA.findIndex( (el) => { return el == cardB } ) > -1
            }
        }

        var card1Index = orderedCardNames.findIndex((cardName) => { return findCardNameDeep(cardName, card1.name) });
        var card2Index = orderedCardNames.findIndex((cardName) => { return findCardNameDeep(cardName, card2.name) });

        if (card1Index == card2Index) {
            console.warn("Should not happen");
            return 0;

        }
        if (card1Index > card2Index) {
            return -1;
        } else {
            return 1;
        }
    }

    checkWinner(tableCardDeck, firstPlayed) {
        const playedSeatorder = this.calculateSeatOrder(firstPlayed);
        var onCard = this.getOnCard(tableCardDeck, firstPlayed);
        var onCards = this.regularOrder.map( (level) => {
            return this.levelMappingFunction(onCard.race, level);
        });
        
        var winningTeam;
        var orderedCardNames = this.createRemainingRaceCardlist(onCards, onCard.race);

        var highestCard = onCard;
        var winningPlayerSeat = playedSeatorder[0]; // start with first card played
        for (var i = 1; i < 4; i++) {
            const crtCardCheck = tableCardDeck["player" + playedSeatorder[i]];

            // check if card is higher?
            if (this.compareCards(orderedCardNames, crtCardCheck, highestCard) > 0) {
                highestCard = crtCardCheck;
                winningPlayerSeat = playedSeatorder[i];
            }
        }

        var stichValue = AbsoluteSeatNumbers().map((seatNumber) => {
            return this.calculateCardValue(tableCardDeck["player" + seatNumber]);
        }).reduce((acc, crt) => acc + crt);

        var team1Score = 0;
        var team2Score = 0;
        switch (winningPlayerSeat) {
            case 0:
            case 2:
                winningTeam = 1;
                team1Score = stichValue;
                team2Score = 0;
                break;
            case 1:
            case 3:
                winningTeam = 2;
                team1Score = 0;
                team2Score = stichValue;
        }

        console.log("checkWinner", tableCardDeck, firstPlayed, winningPlayerSeat, highestCard);
        return {
            winningPlayerSeat,
            winningTeam,
            team1Score,
            team2Score,
        }
    }

    calculateCardValue(card) {
        switch (card.level) {
            case "A":
                return 11;
            case "K":
                return 4;
            case "Q":
                return 3;
            case "J":
                return 2;
            case "X":
                return 10;
            case "8":
                return 8;
            default:
                return 0;
        }
    }
}

module.exports = {
    ModeTannenbaum,
};