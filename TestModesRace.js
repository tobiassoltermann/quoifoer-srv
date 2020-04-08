const {
    ModeHearts,
    ModeClubs,
    ModeSpades,
    ModeDiamonds
} = require('./gamerules/coiffeurmodes/ModesRace');

const CoiffeurCardSet = require('./gamerules/CoiffeurCardSet');
const CardSet = require('./gamerules/CardSet');
const Card = require('./gamerules/Card');

this.cardSet = new CoiffeurCardSet();

const CoiffeurSet = new CoiffeurCardSet();

function logCanPlay(card, can) {
    console.log("Can play ", card.name, ": ", can ? "yes" : "no" );
}
const testSuite1 = () => {
    player = new CardSet();
    player.addAllCards(
        [
            /*new Card('H','A'),*/
            new Card('H','6'),
            new Card('H','X'),
            new Card('H','J'),
            new Card('S','6'),
            new Card('S','7'),
            new Card('C','8'),
            new Card('S','A'),
            new Card('C','X'),
            new Card('S','K'),
            new Card('S','J'),
        ]
    );

    var tableCardDeck = {
        S: { card: this.cardSet.getSpecificCardByName("C7") },
        E: { card: this.cardSet.getSpecificCardByName("H8") },
        N: { card: null },
        W: { card: null },
    }

    const hearts = new ModeDiamonds(1);

    player.allCards().forEach( (card) => {
        if (card.name == "CX") {
            //debugger;
        }
        const canPlay = hearts.checkCanPlayCard(player, tableCardDeck, card, 0);
        logCanPlay(card, canPlay);
    });


    tableCardDeck = {
        S: { card: this.cardSet.getSpecificCardByName("CX") },
        E: { card: this.cardSet.getSpecificCardByName("H8") },
        N: { card: this.cardSet.getSpecificCardByName("CA") },
        W: { card: this.cardSet.getSpecificCardByName("CJ") },
    }

    console.log(hearts.checkWinner(tableCardDeck, 3));
};


testSuite1();
