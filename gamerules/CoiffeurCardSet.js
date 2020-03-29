const Card = require('./Card');
const CardSet = require('./CardSet');

const CoiffeurCardSet = new CardSet()
.addAllCards(
    [
        { race: 'H', level: '6' },
        { race: 'H', level: '7' },
        { race: 'H', level: '8' },
        { race: 'H', level: '9' },
        { race: 'H', level: 'X' },
        { race: 'H', level: 'J' },
        { race: 'H', level: 'Q' },
        { race: 'H', level: 'K' },
        { race: 'H', level: 'A' },

        { race: 'S', level: '6' },
        { race: 'S', level: '7' },
        { race: 'S', level: '8' },
        { race: 'S', level: '9' },
        { race: 'S', level: 'X' },
        { race: 'S', level: 'J' },
        { race: 'S', level: 'Q' },
        { race: 'S', level: 'K' },
        { race: 'S', level: 'A' },

        { race: 'K', level: '6' },
        { race: 'K', level: '7' },
        { race: 'K', level: '8' },
        { race: 'K', level: '9' },
        { race: 'K', level: 'X' },
        { race: 'K', level: 'J' },
        { race: 'K', level: 'Q' },
        { race: 'K', level: 'K' },
        { race: 'K', level: 'A' },

        { race: 'C', level: '6' },
        { race: 'C', level: '7' },
        { race: 'C', level: '8' },
        { race: 'C', level: '9' },
        { race: 'C', level: 'X' },
        { race: 'C', level: 'J' },
        { race: 'C', level: 'Q' },
        { race: 'C', level: 'K' },
        { race: 'C', level: 'A' },
    ].map(
        (element) => {
            return new Card(element.race, element.level);
        }
    )
);

module.exports = CoiffeurCardSet;