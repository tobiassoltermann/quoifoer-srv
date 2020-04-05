
class Card {
    constructor(race, level) {
        this.race = race;
        this.level = level;
        this.name = race + level;
        this.playable = false;
    }

    getRace() { return this.race };
    getLevel() { return this.level };
    toString() { return this.name };

    render() { return {
        card: this.name,
        playable: this.playable,
    }}

}

module.exports = Card;