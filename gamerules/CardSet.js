

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

    removeCard(card) {
        this.cards = this.cards.filter( (crtCard) => {
            return crtCard.name != card.name;
        });
    }
    getCard(cardName) {
        //return this.cards[card.name];
        return this.cards.find( (card) => { return card.name == cardName } );
    }
    allCards() {
        //Object.values(this.cards);
        return this.cards.slice();
    }

    getSpecificCardByName(cardName) {
        return this.cards.find( (card) => { return card.name == cardName});
    }
    
    hasSpecificCardByName(cardName) {
        //return (this.cards.filter( (card) => card.name ==  name)) == 1;
        return this.cards.findIndex( (card) => { return card.name == cardName}) >= 0;
    }
    hasSpecificCardByRaceLevel(race, level) {
        return this.hasSpecificCardByName(race+level);
    }

    hasCardsFromRace(race) {
        return this.allCardsFromRace(race).length() > 0;
    }

    render() {
        return this.cards.map( (card) => {
            return card.render();
        });
    }

    length() {
        return this.cards.length;
    }

// Returns a set
    shuffle() {
        shuffleFisherYates(this.cards);
        return this;
    }

    allCardsFromRace(race) {
        var subSet = new CardSet();
        subSet.addAllCards( this.cards.filter(
            (card) => {
                const differentRace = card.race == race;
                return differentRace;
            }) );
        
        return subSet;
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


}

module.exports = CardSet;