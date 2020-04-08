
const Card = require('./Card');
const CardSet = require('./CardSet');
const CoiffeurScores = require('./CoiffeurScores');
const CoiffeurCardSet = require('./CoiffeurCardSet');
const ClosedCardSet = require('./ClosedCardSet');
const RoundManager = require('./RoundManager');
const SuperSachCoiffeurModeList = require('./SuperSachCoiffeurModeList');
const { getTeamBySeat, createTeamNames, shortenPlayername, getSeatOrderMechanism, createEmptyPlayerSeats, AbsoluteSeatOrder, RelativeSeatOrder } = require('./CoiffeurHelpers');

class CoiffeurGamerules {
    constructor(room) {
        this.modes = new SuperSachCoiffeurModeList();
        this.scoresObject = new CoiffeurScores();
        this.cardSet = new CoiffeurCardSet();
        this.room = room;
        
        this.gameState = {
            status: "PLAYER_SEATING",
            playerCardDecks: {
                player0: new CardSet(),
                player1: new CardSet(),
                player2: new CardSet(),
                player3: new CardSet(),
            },
            seatsAbsolute: {
                
            },
            tableCardDeck: {
                S: {
                    card: this.cardSet.getSpecificCardByName("H6"),
                },
                E: {
                    card: this.cardSet.getSpecificCardByName("S7"),
                },
                N: {
                    card: this.cardSet.getSpecificCardByName("C8"),
                },
                W: {
                    card: this.cardSet.getSpecificCardByName("K9"),
                },
            }
        };
        this.roundManager = new RoundManager(this);
    }

    // Must implement!
    onPlayerJoin(player) {
        console.log("join", player.getName());
        player.client.on('coiffeur-requestgamestate', () => {
            this.sendGameStateAll();
        })

        player.client.on('coiffeur-seat', (compass, response) => {
            var seatNo = AbsoluteSeatOrder().findIndex((crt) => { return compass == crt }); // XLATE: compassToSeatNo()
            if (seatNo == -1) {
                response({
                    status: false,
                    message: "Seat " + compass + " doesn't exist"
                });
                return;
            }
            if (this.room.getPlayerBySeat(seatNo) === undefined) {
                // Can seat as it's free
                player.assignSeat(seatNo);
                response({
                    status: true,
                });

            } else {
                response({
                    status: false,
                    message: "Seat was already taken."
                });
                return;
            }
            var allSeatsOccupied = this.room.getTotalNumberSeated();
            if (allSeatsOccupied >= 4) {
                this.beginRound(false);
            }
            this.sendGameStateAll();
        });

        player.client.on('coiffeur-unseat', (response) => {
            player.unSeat();
            this.sendGameStateAll();
        });

        player.client.on('coiffeur-selectpush', () => {
            this.roundManager.pushSelected();
            this.sendGameStateAll();
        });

        player.client.on('coiffeur-selecttrick', (multiplier) => {
            this.roundManager.trickSelected(multiplier);
            this.sendGameStateAll();
        });

        player.client.on('coiffeur-playcard', (cardName, response) => {
            console.log("coiffeur-playcard", cardName);
            const playerCardDeck = this.gameState.playerCardDecks["player" + player.getSeat()];
            const card = playerCardDeck.getSpecificCardByName(cardName);

            if (card != undefined) {
                this.roundManager.playCard(card);
                this.sendGameStateAll();
            } else {
                response({
                    status: false,
                    message: "You don't seem to have this card",
                });
            }
        });
    }

    beginRound(updateClients) {
        this.roundManager.beginRound();

        if (updateClients) {
            this.sendGameStateAll();
        }
    }

    // Must implement!
    // TODO: Necessary? Used?
    onPlayerLeave(player) {
        player.unSeat();
        this.sendGameStateAll();
    }

    compilePlayerGamestate(player) {
        
        this.compileSeating(player);
        var localGamestate = {};
        var boardSetup =
            Object.assign({},
                this.gameState.seatsAbsolute,
            );

        const absSO = AbsoluteSeatOrder();
        //const relSO = RelativeSeatOrder(player);
        const relSO = getSeatOrderMechanism(this.gameState.status, player);
        for (var i = 0; i < 4; i++) {
            const thisCard = this.gameState.tableCardDeck[absSO[i]].card;
            if (thisCard != null) {
                boardSetup[relSO[i]].card = thisCard.renderName();
            } else {
                boardSetup[relSO[i]].card = null;
            }
        }

        boardSetup.self = AbsoluteSeatOrder()[player.getSeat()];


        var scores = this.scoresObject.render();
        scores.team1Name = createTeamNames(boardSetup.N.playerName, boardSetup.S.playerName);
        scores.team2Name = createTeamNames(boardSetup.W.playerName, boardSetup.E.playerName);

        var overallUIState;
        if (this.gameState.status == "PLAYER_SEATING") {
            if (player.getSeat() == null) {
                overallUIState = {
                    statusText: {
                        label: "Please take a seat.",
                        icon: null,
                        visible: true,
                        highlight: true,
                    },
                }
            } else {
                overallUIState = {
                    statusText: {
                        label: "Wait for others.",
                        icon: null,
                        visible: true
                    },
                }
            }
        };

        var yourTeam = getTeamBySeat(player.getSeat());
        if (yourTeam > 0) {
            scores.scoreLines = scores.scoreLines.map((scoreLine) => {
                const myScoreOnLine = scoreLine["scoreTeam" + yourTeam];
                const selectable = 
                    (myScoreOnLine == null)
                    && this.gameState.status == "CHOOSE_TRICK"
                    && player.getSeat() == this.gameState.turnSeat

                return Object.assign(
                    scoreLine,
                    { selectable: selectable }
                )
            })
        }

        if (this.gameState.status == "CHOOSE_TRICK") {
            console.log("this.gameState", player.getSeat(), this.gameState);


            localGamestate.myTurn = player.getSeat() == this.gameState.turnSeat;
            localGamestate.canPush = this.gameState.roundPlayerCanPush && localGamestate.myTurn;
            var canPushWords = localGamestate.canPush ? ", or push." : ".";
            if (localGamestate.myTurn) {
                overallUIState = {
                    statusText: {
                        label: "Choose multiplier" + canPushWords,
                        icon: null,
                        visible: true,
                        highlight: true,
                    },
                }
            } else {
                const playersTurn = this.room.getPlayerBySeat(this.gameState.turnSeat);
                const playersName = playersTurn.getName();
                overallUIState = {
                    statusText: {
                        label: "Player " + playersName + " to choose multiplier" + canPushWords,
                        icon: null,
                        visible: true,
                    },
                }
            }
        };
        // IF getSeat is null, what happens?
        const playerCardDeck = this.gameState.playerCardDecks["player" + player.getSeat()];
        if (this.gameState.status == "PLAY_ROUND") {
            localGamestate.myTurn = player.getSeat() == this.gameState.turnSeat;
            localGamestate.canPush = false;
            if (localGamestate.myTurn) {
                
                playerCardDeck.cards.forEach( (card, index) => {
                    playerCardDeck.cards[index].playable = this.roundManager.checkCanPlayCard(playerCardDeck, card);
                });
                overallUIState = {
                    statusText: {
                        label: "Play card",
                        icon: this.gameModeImplementation.getIcon(),
                        visible: true,
                        highlight: true,
                    },
                }
            } else {
                const playersTurn = this.room.getPlayerBySeat(this.gameState.turnSeat);
                const playersName = playersTurn.getName();

                playerCardDeck.cards.forEach( (card, index) => {
                    playerCardDeck.cards[index].playable = false;
                });
                overallUIState = {
                    statusText: {
                        label: "Player " + playersName + " to play card",
                        icon: this.gameModeImplementation.getIcon(),
                        visible: true,
                    },
                }
            }
        }

        
        localGamestate = Object.assign(
            localGamestate,
            {
                gameStatus: this.gameState.status,
                yourTeam: yourTeam,
                scores: scores,
                cardDeck:
                    (player.getSeat() != null && player.getSeat() >= 0)
                        ? playerCardDeck.render()
                        : []
                ,
                boardSetup,
            }
        );

        return [localGamestate, overallUIState];
    }

    sendGameStateAll() {
        this.room.getAllPlayers().forEach((player) => {
            var [localGamestate, overallUIState] = this.compilePlayerGamestate(player);
//            console.log("sendGameStateAll", "localGamestate", localGamestate, overallUIState);
            player.client.emit("coiffeur-gamestate", localGamestate, overallUIState);
            player.client.emit('debugInfo', localGamestate, overallUIState);
        })
    }

    compileSeating(player) {
        var SeatOrderMechanism = getSeatOrderMechanism(this.gameState.status, player);
        var playerSeats = createEmptyPlayerSeats();

        // Fetch all players' names and store locally
        const allPlayers = this.room.getAllPlayers();
        allPlayers.forEach((player) => {
            var playerSeatIndex = player.getSeat();
            if (playerSeatIndex == null) {
                return; // Unseated player.
            }

            playerSeats[SeatOrderMechanism[playerSeatIndex]].playerName = player.getName();
        });

        this.gameState.seatsAbsolute = playerSeats;
        return
    }

    sendGameState(player) {
        player.client.emit('coiffeur-gamestate', this.gameState);
    }

    emitAllPlayers(event, ...args) {
        this.room.getAllPlayers().forEach((player) => {
            player.emit(event, ...args);
        })
    }
    distributeCards() {
        const shuffledCards = this.cardSet.shuffle();
        this.gameState.playerCardDecks = {
            player0: shuffledCards.slice(0, 9).sort(),
            player1: shuffledCards.slice(9, 18).sort(),
            player2: shuffledCards.slice(18, 27).sort(),
            player3: shuffledCards.slice(27, 36).sort(),
        };
    }

    maxPlayers() {
        return 4;
    }
}

module.exports = CoiffeurGamerules;