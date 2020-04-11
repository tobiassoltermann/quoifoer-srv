const ModeList = require('./ModeList');

class Mode {
    constructor(name, multiplier, icon) {
        this.name = name;
        this.multiplier = multiplier;
        this.icon = icon;
    }

    getMultiplier() { return this.multiplier; }
    getIcon() { return this.icon; }
    getName() { return this.name; }

    checkCanPlayCard(playerCardDeck, tableCardDeck, card, firstPlayed) { return false; }
    hasSubselector() {
        return false;
    }
    getSubselectorName() {
        return null;
    }
    setSubselection(subselection) {
        return;
    }
}

module.exports = Mode;