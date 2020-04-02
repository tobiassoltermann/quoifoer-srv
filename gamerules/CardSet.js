

function shuffleFisherYates(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

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
        });
    }
    getCard(cardName) {
        return this.cards[card.name];
    }

    getShuffledCardDeck() {
        var cardsArray = Object.keys(this.cards);
        cardsArray = shuffleFisherYates(cardsArray);
        return cardsArray.map( (key) => {return this.cards[key]});
    }
    allCards() {
        Object.values(this.cards);
    }

    hasSpecificCardByName(name) {
        return (this.cards.filter( (card) => card.name ==  name)) == 1;
    }
    hasSpecificCardByRaceLevel(race, level) {
        return this.hasSpecificCardByName(race+level);
    }

    hasCardsFromRace(race) {
        return (this.cards.filter( (card) => card.race ==  race)) > 0;
    }
}

module.exports = CardSet;