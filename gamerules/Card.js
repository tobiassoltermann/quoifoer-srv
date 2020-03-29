
class Card {
    constructor(race, level) {
        this.race = race;
        this.level = level;
        this.name = race + level;
    }

    getRace() { return this.race };
    getLevel() { return this.level };
    toString() { return this.name };

}

module.exports = Card;