
const Status = {
    CHOOSE_TRUMP: {

    }
}

class Round {

}
class Card {
    constructor(race, level) {
        this.race = race;
        this.level = level;
        this.name = race + level;
    }

    getRace() { return this.race };
    getLevel() { return this.level };
    toString() { return this.name };

}

class CardSet {
    constructor() {
        this.cards={};
    }

    addCard(card) {
        this.cards[card.name] = card;
    }
    addAllCards(cards) {
        cards.forEach( (card) => {
            this.addCard(card);
        })
    }
    getCard(cardName) {
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

const CoiffeurCardSet = new CardSet()
.addAllCards(
    [
        { race: 'H', level: '6'},
        { race: 'H', level: '7'},
        { race: 'H', level: '8'},
        { race: 'H', level: '9'},
        { race: 'H', level: 'X'},
        { race: 'H', level: 'J'},
        { race: 'H', level: 'Q'},
        { race: 'H', level: 'K'},
        { race: 'H', level: 'A'},

        { race: 'S', level: '6'},
        { race: 'S', level: '7'},
        { race: 'S', level: '8'},
        { race: 'S', level: '9'},
        { race: 'S', level: 'X'},
        { race: 'S', level: 'J'},
        { race: 'S', level: 'Q'},
        { race: 'S', level: 'K'},
        { race: 'S', level: 'A'},
        
        { race: 'K', level: '6'},
        { race: 'K', level: '7'},
        { race: 'K', level: '8'},
        { race: 'K', level: '9'},
        { race: 'K', level: 'X'},
        { race: 'K', level: 'J'},
        { race: 'K', level: 'Q'},
        { race: 'K', level: 'K'},
        { race: 'K', level: 'A'},
        
        { race: 'C', level: '6'},
        { race: 'C', level: '7'},
        { race: 'C', level: '8'},
        { race: 'C', level: '9'},
        { race: 'C', level: 'X'},
        { race: 'C', level: 'J'},
        { race: 'C', level: 'Q'},
        { race: 'C', level: 'K'},
        { race: 'C', level: 'A'},
    ].map(
        (element) => {
            return new Card(element.race, element.level);
        }
    )
);

class CoiffeurGamerules {
    constructor(room) {
        this.room = room;
        console.log(room.name);
        this.gameState = {
            status: Status.PLAYER_SEATING,
            scoreResult: {
                
            },
            cardSet: CoiffeurCardSet,
            playerCardDecks: {
                player0: {},
                player1: {},
                player2: {},
                player3: {},
            },
            tableCardDeck: {

            }
        };
    }

    // Must implement!
    onPlayerJoin(player) {
        console.log("join", player);
        player.client.on('coiffeur-requestgamestate', () => {
            player.client.emit("coiffeur-gamestate", this.gameState.status);
        })

        player.client.on('coiffeur-seat', (seatNo, response) => {
            if (this.room.getPlayerBySeat(seatNo) == null) {
                // Can seat as it's free
                player.assignSeat(seatNo);
                response({
                    status: true,
                });
            
            }else {
                response({
                    status: false,
                    message: "Seat was already taken."
                });
            }
            this.sendGameState(player);
        });
    }

    // Must implement!
    onPlayerLeave(player) {
        console.log("leave", player);
    }

    sendGameState(player) {
        player.client.emit('coiffeur-gamestate', this.gameState);
    }

    sendPlayerSeatsAbsolute() {
        const seatOrder = [ 's', 'e', 'n', 'w'];
        playerSeats = {
            s: null,
            e: null, 
            n: null, 
            w: null,
        };
        const allPlayers = this.room.getAllPlayers();

        allPlayers.forEach((player) => {
            var absoluteSeatIndex = player.getSeat();
            if (absoluteSeatIndex == null) {
                return; // Unseated player.
            }
            if (playerSeats[seatOrder[absoluteSeatIndex]] != null) {
                console.log("Double seat! ", player.getName());
                return;
            }
            playerSeats[seatOrder[absoluteSeatIndex]] = player.getName();
        });
        
        emitAllPlayers("coiffeur-absoluteseats", playerSeats);
    }

    emitAllPlayers(event, ...args) {
        this.room.getAllPlayers().forEach( (player) => {
            player.emit(event, ...args);
        })
    }
    distributeCards() {
        const shuffledCardSet = this.cardSet.getShuffledCardDeck();
        this.playerCardDecks = {
            player0: shuffledCards.slice(0, 9),
            player1: shuffledCards.slice(9, 18),
            player2: shuffledCards.slice(18, 27),
            player3: shuffledCards.slice(27, 36),
        };
    }

    maxPlayers() {
        return 4;
    }
}

//CoiffeurGamerules.Status = Status;
module.exports = CoiffeurGamerules;