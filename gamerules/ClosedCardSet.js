const Card = require('./Card');

function ClosedCardSet (n) {
    return Array(n).fill(
        (new Card('N', 'N')).render()
    );
};

module.exports = ClosedCardSet;