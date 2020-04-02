const Card = require('./Card');
const CardSet = require('./CardSet');

class ClosedCardSet extends CardSet {
    constructor(n) {
        super();
        this.addAllCards(
            Array(n).fill(
                (new Card('N', 'N'))
            )
        );
    }
}

module.exports = ClosedCardSet;