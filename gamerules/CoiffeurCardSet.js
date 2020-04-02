const Card = require('./Card');
const CardSet = require('./CardSet');

class CoiffeurCardSet extends CardSet {
    constructor() {
        super();
        this.addAllCards(
            [
                new Card('H','6'),
                new Card('H','7'),
                new Card('H','8'),
                new Card('H','9'),
                new Card('H','X'),
                new Card('H','J'),
                new Card('H','Q'),
                new Card('H','K'),
                new Card('H','A'),

                new Card('S','6'),
                new Card('S','7'),
                new Card('S','8'),
                new Card('S','9'),
                new Card('S','X'),
                new Card('S','J'),
                new Card('S','Q'),
                new Card('S','K'),
                new Card('S','A'),

                new Card('K','6'),
                new Card('K','7'),
                new Card('K','8'),
                new Card('K','9'),
                new Card('K','X'),
                new Card('K','J'),
                new Card('K','Q'),
                new Card('K','K'),
                new Card('K','A'),

                new Card('C','6'),
                new Card('C','7'),
                new Card('C','8'),
                new Card('C','9'),
                new Card('C','X'),
                new Card('C','J'),
                new Card('C','Q'),
                new Card('C','K'),
                new Card('C','A'),
            ]
        );
    }
}

module.exports = CoiffeurCardSet;