
const {
    ModeHearts,
    ModeClubs,
    ModeSpades,
    ModeDiamonds,
} = require('./ModesRace');


const {
    ModeUp,
    ModeDown,
} = require('./ModesDirectional');

const {
    ModeTannenbaum,
} = require('./ModeTannenbaum');


const Mode = require('./Mode');

class ModeJoker extends Mode {

    constructor(multiplier) {
        super("JOKER", multiplier, "trumpJ");
        this.implementations = {
            "trumpC": new ModeClubs(multiplier),
            "trumpH": new ModeHearts(multiplier),
            "trumpS": new ModeSpades(multiplier),
            "trumpK": new ModeDiamonds(multiplier),
            "trumpD": new ModeDown(multiplier),
            "trumpU": new ModeUp(multiplier),
            "trumpT": new ModeTannenbaum(multiplier),
        }
        this.currentImplementation = null;
    }

    checkCanPlayCard(playerCardDeck, tableCardDeck, card, firstPlayed) {
        return this.currentImplementation.checkCanPlayCard(playerCardDeck, tableCardDeck, card, firstPlayed);
    }

    checkWinner(tableCardDeck, firstPlayed) {
        return this.currentImplementation.checkWinner(tableCardDeck, firstPlayed);
    }


    hasSubselector() {
        return true;
    }
    getSubselectorName() {
        return "CoiffeurModeJokerSubselector";
    }

    setSubselection(subselection) {
        this.currentImplementation = this.implementations[subselection.subMode];
        this.numberOfStiche = 0;
    }
}

module.exports = {
    ModeJoker
};