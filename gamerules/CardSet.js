

class CardSet {
    constructor() {
        this.cards = {};
    }

    addCard(card) {
        this.cards[card.name] = card;
    }
    addAllCards(cards) {
        cards.forEach((card) => {
            this.addCard(card);
        })
    }
    getCard(cardName) {
        return this.cards[card.name];
    }
    getShuffledCardDeck() {
        const shuffledCards = Object.assign({}, this.cards);
        return {
            entireSet: shuffledCards,
        }
    }
    allCards() {
        Object.values(this.cards);
    }
}

module.exports = CardSet;