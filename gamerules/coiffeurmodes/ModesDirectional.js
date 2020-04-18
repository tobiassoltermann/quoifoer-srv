const Mode = require('./Mode');
const {
    arrayRotate,
    AbsoluteSeatNumbers,
} = require('../JassHelpers');

class ModesDirectional extends Mode {
    constructor(name, multiplier, icon, direction) {
        super(name, multiplier, icon);
        this.direction = direction;
        this.regularOrder = (() => {
            switch (direction) {
                case "U":
                    return ["6", "7", "8", "9", "X", "J", "Q", "K", "A"];
                case "D":
                    return ["A", "K", "Q", "J", "X", "9", "8", "7", "6"]
            }
        })();

    }

    checkCanPlayCard(playerCardDeck, tableCardDeck, card, firstPlayed) {
        var onCard = this.getOnCard(tableCardDeck, firstPlayed);

        var isOnCard = onCard.race == card.race;
        if (isOnCard) {
            return true; // Normal on-card
        }

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

    createRemainingRaceCardlist(onCards, onRace) {
        var remainingRaces = ['H', 'S', 'K', 'C'].filter((crt) => {
            return (crt != onRace);
        });

        var remainingCards = [];
        remainingRaces.forEach((race) => {
            remainingCards.push(...this.regularOrder.map((level) => { return race + level }))
        })
        return [].concat(onCards, remainingCards);
    }

    compareCards(orderedCardNames, card1, card2) {
        var card1Index = orderedCardNames.findIndex((cardName) => { return card1.name == cardName });
        var card2Index = orderedCardNames.findIndex((cardName) => { return card2.name == cardName });

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
        var onCards = this.regularOrder.map((level) => { return onCard.race + level });
        
        var winningTeam;
        var orderedCardNames = this.createRemainingRaceCardlist(onCards, onCard.race);

        var highestCard = onCard;
        var winningPlayerSeat = playedSeatorder[0]; // start with first card played
        for (var i = 1; i < 4; i++) {
            const crtCardCheck = tableCardDeck["player" + playedSeatorder[i]];

            // check if card is higher?
            if (this.compareCards(orderedCardNames, crtCardCheck, highestCard) > 0) {
                highestCard = crtCardCheck;
                winningPlayerSeat = playedSeatorder[i];
            }
        }

        var stichValue = AbsoluteSeatNumbers().map((seatNumber) => {
            return this.calculateCardValue(tableCardDeck["player" + seatNumber]);
        }).reduce((acc, crt) => acc + crt);

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
                switch (this.direction) {
                    case "U":
                        return 0;
                    case "D":
                        return 11;
                }
            case "6":
                switch (this.direction) {
                    case "U":
                        return 11;
                    case "D":
                        return 0;
                }
            case "K":
                return 4;
            case "Q":
                return 3;
            case "J":
                return 2;
            case "X":
                return 10;
            case "8":
                return 8;
            default:
                return 0;
        }
    }
}

class ModeUp extends ModesDirectional {
    constructor(multiplier) {
        super("UP", multiplier, 'trumpU', "U");
    }
}
class ModeDown extends ModesDirectional {
    constructor(multiplier) {
        super("DOWN", multiplier, 'trumpD', "D");
    }
}

module.exports = {
    ModeUp,
    ModeDown,
    ModesDirectional,
};