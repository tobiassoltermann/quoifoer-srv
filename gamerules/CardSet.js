

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

function sortByRaceLevel(array) {
    const HIGH_ORDERS = [ 'H', 'S', 'C', 'K' ];
    const LOW_ORDERS = [ '6', '7', '8', '9', 'X', 'J', 'Q', 'K', 'A'];
    
    const absoluteValue = (card) => {
        const race = card.getRace();
        const level = card.getLevel();
        return (HIGH_ORDERS.findIndex( (hO) => race == hO )+1) * 100 + (LOW_ORDERS.findIndex( (lO) => level == lO ) + 1);
    }

    array.sort( (a, b) => {
        return absoluteValue(a) - absoluteValue(b);
    });
}

class CardSet {
    constructor() {
        //this.cards = {};
        this.cards = [];
    }

    addCard(card) {
        //this.cards[card.name] = card;
        this.cards.push(card);
    }
    addAllCards(cards) {
        cards.forEach((card) => {
            this.addCard(card);
        });
    }
    getCard(cardName) {
        //return this.cards[card.name];
        return this.cards.find( (card) => { return card.name == cardName } );
    }
    shuffle() {
        shuffleFisherYates(this.cards);
        return this;
    }

    allCards() {
        //Object.values(this.cards);
        return this.cards.slice();
    }

    hasSpecificCardByName(cardName) {
        //return (this.cards.filter( (card) => card.name ==  name)) == 1;
        return this.cards.findIndex( (card) => { return card.name == cardName}) >= 0;
    }
    hasSpecificCardByRaceLevel(race, level) {
        return this.hasSpecificCardByName(race+level);
    }

    hasCardsFromRace(race) {
        return (this.cards.filter( (card) => { return card.race == race} )) > 0;
    }

    slice(start, end) {
        var subSet = new CardSet();
        subSet.addAllCards( this.cards.slice(start, end) );
        return subSet;
    }

    sort() {
        sortByRaceLevel(this.cards);
        return this;
    }

    render() {
        return this.cards.map( (card) => {
            return card.render();
        });
    }
}

module.exports = CardSet;