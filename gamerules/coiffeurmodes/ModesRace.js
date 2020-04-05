const Mode = require('./Mode');

class ModeRace extends Mode {
    constructor(name, multiplier, icon, race) {
        super(name, multiplier, icon);
        this.race = race;
    }

    // DUMMYTRACK
    checkCanPlayCard(player, card) {
        return card.race == this.race;
    }
}

class ModeHearts extends ModeRace {
    constructor(multiplier) {
        super("HEARTS", multiplier, 'trumpH', "H");
    }
}
class ModeClubs extends ModeRace {
    constructor(multiplier) {
        super("CLUBS", multiplier, 'trumpC', "C");
    }
}
class ModeSpades extends ModeRace {
    constructor(multiplier) {
        super("SPADES", multiplier, 'trumpS', "S");
    }
}
class ModeDiamonds extends ModeRace {
    constructor(multiplier) {
        super("DIAMOND", multiplier, 'trumpK', "K");
    }
}


module.exports = {
    ModeHearts,
    ModeClubs,
    ModeSpades,
    ModeDiamonds,
};