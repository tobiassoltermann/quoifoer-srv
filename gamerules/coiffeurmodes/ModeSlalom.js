const Mode = require('./Mode');
const { ModesDirectional } = require('./ModesDirectional');
const {
    arrayRotate,
    AbsoluteSeatNumbers,
} = require('../JassHelpers');

class ModeSlalom extends ModesDirectional {
    constructor(multiplier) {
        super("SLALOM", multiplier, "trumpA");
        this.possibleRegularOrders = {
            U: ["6", "7", "8", "9", "X", "J", "Q", "K", "A"],
            D: ["A", "K", "Q", "J", "X", "9", "8", "7", "6"],
        };
        this.numberOfStiche = 0;
    }

    setRegularOrder(direction) {
        this.regularOrder = this.possibleRegularOrders[direction];
    }

    createRemainingRaceCardlist(onCards, onRace) {
        var remainingRaces = ['H', 'S', 'K', 'C'].filter((crt) => {
            return (crt != onRace);
        });

        var remainingCards = [];
        remainingRaces.forEach((race) => {
            remainingCards.push(...this.regularOrder.map((level) => { return race + level }))
        })
        return [].concat(onCards, remainingCards);
    }

    compareCards(orderedCardNames, card1, card2) {
        var card1Index = orderedCardNames.findIndex((cardName) => { return card1.name == cardName });
        var card2Index = orderedCardNames.findIndex((cardName) => { return card2.name == cardName });

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
        this.currentDirection = ["U", "D"][this.numberOfStiche % 2];
        this.setRegularOrder(this.currentDirection);
        
        var results = super.checkWinner(tableCardDeck, firstPlayed);


        this.numberOfStiche++;
        return results;
    }

    hasSubselector() {
        return true;
    }
    getSubselectorName() {
        return "CoiffeurModeSlalomSubselector";
    }

    setSubselection(subselection) {
        this.direction = subselection.direction;
        this.currentDirection = this.direction;
        this.numberOfStiche = 0;
        this.setRegularOrder(this.currentDirection);
    }
}

module.exports = {
    ModeSlalom,
};