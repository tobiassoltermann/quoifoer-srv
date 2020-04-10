const Mode = require('./Mode');
const {
    arrayRotate,
    AbsoluteSeatNumbers,
} = require('../CoiffeurHelpers');

class ModeRace extends Mode {
    constructor(name, multiplier, icon, race) {
        super(name, multiplier, icon);
        this.race = race;
        this.trumpfOrder = ['J', '9', 'A', 'K', 'Q', 'X', '8', '7', '6'];
        this.regularOrder = ['A', 'K', 'Q', 'J', 'X', '9', '8', '7', '6'];
        this.trumpfCards = this.trumpfOrder.map((level) => { return this.race + level });
    }

    checkCanPlayCard(playerCardDeck, tableCardDeck, card, firstPlayed) {
        const playedSeatorder = this.calculateSeatOrder(firstPlayed);
        var onCard = this.getOnCard(tableCardDeck, firstPlayed);

        if (card.race == this.race && card.level == 'J') {
            return true; // You can always play trump J.
        }
        var isOnCard = onCard.race==card.race;
        if (isOnCard) {
            return true; // Normal on-card
        }

        var trumpIsOn = onCard.race == this.race;
        if (trumpIsOn) {

            var playersTrumpCards = playerCardDeck.allCardsFromRace(this.race);
            var playersTrumpCardsCount = playersTrumpCards.length();
            var playerHasTrumpCards = playersTrumpCardsCount > 0;
            if (playerHasTrumpCards) {
                var playersOnlyTrumpIsJ = playersTrumpCardsCount == 1 && playersTrumpCards.hasSpecificCardByRaceLevel(this.race, "J");
                if (playersOnlyTrumpIsJ) {
                    return true;
                } else {
                    var isCurrentCardTrump = card.race == this.race;
                    if (isCurrentCardTrump) {
                        return true;
                    } else {
                        return false;
                    }
                }
            } else {
                return true;
            }
        } else {
            if (card.race == this.race) {

                const hasOtherPlayerPlayedHigherTrumpBefore = ((compareToCard) => {
                    var highestTrumpCardIndex = this.trumpfCards.findIndex( (trumpfCard) => {return trumpfCard == (this.race + compareToCard.level) });; // start with current players' card.
                    for(var i = 1; i < 4; i++) {
                        const crtCardCheck = tableCardDeck["player" + i];
                        if (crtCardCheck != null && crtCardCheck.race == this.race) {
                            const crtCardIndex = this.trumpfCards.findIndex( (trumpfCard) => {return trumpfCard == (this.race + crtCardCheck.level) });
                            if (crtCardIndex == -1) {
                                console.warn("Shouldn't happen. ModesRace::checkCanPlayCard. Cannot find whether other cards have been higher", this.trumpfCards);
                            }
                            if (crtCardIndex < highestTrumpCardIndex) {
                                return true;
                            }
                        }
                    }
                    return false;
                }).bind(this);

                if (hasOtherPlayerPlayedHigherTrumpBefore(card)) {

                    return false;
                } else {
                    return true;
                }
            } else {
                var playerHasOnCards = playerCardDeck.hasCardsFromRace(onCard.race);
                if (playerHasOnCards) {
                    return false;
                } else {
                    if (onCard.race == card.race) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }
        }
    }

    createRaceCardlist(race) {
        if (race == this.race) {
            return this.trumpfCards;
        } else {
            return this.regularOrder.map((level) => { return race + level });
        }
    }

    createRemainingRaceCardlist(onCards, onRace) {
        var remainingRaces = ['H', 'S', 'K', 'C'].filter( (crt) => {
            return (crt != this.race) && (crt != onRace);
        });

        var remainingCards = [];
        remainingRaces.forEach( (race) => {
            remainingCards.push(...this.regularOrder.map((level) => { return race + level }))
        })
        return [].concat(this.trumpfCards, onCards, remainingCards);
    }

    compareCards(orderedCardNames, card1, card2) {
        var card1Index = orderedCardNames.findIndex( (cardName) => { return card1.name == cardName });
        var card2Index = orderedCardNames.findIndex( (cardName) => { return card2.name == cardName });

        if (card1Index == card2Index) {
            console.warn("Should not happen");
            return 0;

        }
        if (card1Index > card2Index) {
            return -1;
        } else {
            return 1;
        }
    }

    checkWinner(tableCardDeck, firstPlayed) {
        const playedSeatorder = this.calculateSeatOrder(firstPlayed);
        var onCard = this.getOnCard(tableCardDeck, firstPlayed);
        var onCards = this.createRaceCardlist(onCard.race);
        var winningTeam;
        var orderedCardNames = this.createRemainingRaceCardlist(onCards, onCard.race);

        var highestCard = onCard;
        var winningPlayerSeat = playedSeatorder[0]; // start with first card played
        for(var i = 1; i < 4; i++) {
            const crtCardCheck = tableCardDeck["player" + playedSeatorder[i]];

            // check if card is higher?
            if (this.compareCards(orderedCardNames, crtCardCheck, highestCard ) > 0) {
                highestCard = crtCardCheck;
                winningPlayerSeat = playedSeatorder[i];
            }
        }

        var stichValue = AbsoluteSeatNumbers().map( (seatNumber) => {
            return this.calculateCardValue( tableCardDeck["player" + seatNumber] );
        }).reduce( (acc, crt) => acc + crt ); 

        var team1Score = 0;
        var team2Score = 0;
        switch (winningPlayerSeat) {
            case 0:
            case 2:
                winningTeam = 1;
                team1Score = stichValue;
                team2Score = 0;
            break;
            case 1:
            case 3:
                winningTeam = 2;
                team1Score = 0;
                team2Score = stichValue;
        }
        // TODO: winningPlayerSeat is WRONG!
        console.log("checkWinner", tableCardDeck, firstPlayed, winningPlayerSeat, highestCard);
        return {
            winningPlayerSeat,
            winningTeam,
            team1Score,
            team2Score,
        }
    }

    calculateSeatOrder(firstPlayed) {
        return arrayRotate([0, 1, 2, 3], firstPlayed);
    }
    getOnCard(tableCardDeck, firstPlayed) {
        const playedSeatorder = arrayRotate([0, 1, 2, 3], firstPlayed);
        var onCard = tableCardDeck["player" + playedSeatorder[0]];
        return onCard;
    }

    calculateCardValue(card) {
        switch (card.level) {
            case "A":
                return 11;
            case "K":
                return 4;
            case "Q":
                return 3;
            case "J":
                return card.race == this.race ? 20 : 2;
            case "X":
                return 10;
            case "9":
                return card.race == this.race ? 14 : 0;
            default:
                return 0;
        }
    }
}

class ModeHearts extends ModeRace {
    constructor(multiplier) {
        super("HEARTS", multiplier, 'trumpH', "H");
    }
}
class ModeClubs extends ModeRace {
    constructor(multiplier) {
        super("CLUBS", multiplier, 'trumpC', "C");
    }
}
class ModeSpades extends ModeRace {
    constructor(multiplier) {
        super("SPADES", multiplier, 'trumpS', "S");
    }
}
class ModeDiamonds extends ModeRace {
    constructor(multiplier) {
        super("DIAMOND", multiplier, 'trumpK', "K");
    }
}


module.exports = {
    ModeHearts,
    ModeClubs,
    ModeSpades,
    ModeDiamonds,
};