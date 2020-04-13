
const Card = require('./Card');
const CardSet = require('./CardSet');
const CoiffeurScores = require('./CoiffeurScores');
const CoiffeurCardSet = require('./CoiffeurCardSet');
const ClosedCardSet = require('./ClosedCardSet');
const RoundManager = require('./RoundManager');
const SuperSachCoiffeurModeList = require('./SuperSachCoiffeurModeList');
const {
    getTeamBySeat,
    createTeamNames,
    
    translateAbsToRel,
    translateRelToAbs,
    AbsoluteSeatNumbers,
    AbsoluteSeatCompass,

 } = require('./CoiffeurHelpers');

class CoiffeurGamerules {
    constructor(room) {
        this.modes = new SuperSachCoiffeurModeList();
        this.scoresObject = new CoiffeurScores(this.modes);
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
                /* 
                player0: Player,
                player1: Player,
                player2: Player,
                player3: Player,
                */
            },
            tableCardDeck: {
                player0: this.cardSet.getSpecificCardByName("H6"),
                player1: this.cardSet.getSpecificCardByName("S7"),
                player2: this.cardSet.getSpecificCardByName("C8"),
                player3: this.cardSet.getSpecificCardByName("K9"),
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
            var seatNo = AbsoluteSeatCompass().findIndex((crt) => { return compass == crt }); // XLATE: compassToSeatNo()
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
            this.updateSeating();
            if (allSeatsOccupied >= this.maxPlayers()) {
                this.roundManager.beginRound();
            } else {
                this.sendGameStateAll();
            }
        });

        player.client.on('coiffeur-unseat', (response) => {
            this.onPlayerLeave(player);
            
        });

        player.client.on('coiffeur-selectpush', () => {
            this.roundManager.pushSelected();
        });

        player.client.on('coiffeur-selecttrick', (multiplier, subselection) => {
            this.roundManager.trickSelected(multiplier, subselection);
        });

        player.client.on('coiffeur-playcard', (cardName, allCardsUnlocked, response) => {
            console.log("coiffeur-playcard", cardName, allCardsUnlocked);
            if (allCardsUnlocked) {
                console.debug("player", player, "has played card ", cardName, "with all cards unlocked. gameState:", this.gameState);
            }
            const playerCardDeck = this.gameState.playerCardDecks["player" + player.getSeat()];
            const card = playerCardDeck.getSpecificCardByName(cardName);

            if (card != undefined) {
                this.roundManager.playCard(card);
            } else {
                response({
                    status: false,
                    message: "You don't seem to have this card",
                });
            }
        });
    }

    // Must implement!
    // TODO: Necessary? Used?
    onPlayerLeave(player) {
        player.unSeat();
        this.updateSeating();
        this.sendGameStateAll();
    }

    compilePlayerGamestate(player) {
        const gameState = this.gameState;
        var localGamestate = {};
        localGamestate.mySeat = player.getSeat();
        //this.compileSeating(player);


        var scores = this.scoresObject.render();
        
        function getSeatName(seatNo) {
            const playerObj = gameState.seatsAbsolute["player" + seatNo];
            if (playerObj != null) {
                return playerObj.getName();
            }
            return null;
        }
        scores.team1Name = createTeamNames(getSeatName(0), getSeatName(2));
        scores.team2Name = createTeamNames(getSeatName(1), getSeatName(3));

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
        const playerCardDeck = this.gameState.playerCardDecks["player" + player.getSeat()];
        
        if (this.gameState.status == "CHOOSE_TRICK") {
            console.log("this.gameState", player.getSeat(), this.gameState);


            localGamestate.myTurn = player.getSeat() == this.gameState.turnSeat;
            localGamestate.canPush = this.gameState.roundPlayerCanPush && localGamestate.myTurn;
            var canPushWords = localGamestate.canPush ? ", or push." : ".";
            playerCardDeck.cards.forEach( (card, index) => {
                playerCardDeck.cards[index].playable = false;
            });
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
                // TODO: Get name by player seats
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

        if (this.gameState.status == "AWAIT_ENDROUND") {
            // TODO: Get name by player seats

            const winningPlayername = this.room.getPlayerBySeat(this.gameState.winningPlayerSeat).getName();

            playerCardDeck.cards.forEach( (card, index) => {
                playerCardDeck.cards[index].playable = false;
            });
            overallUIState = {
                statusText: {
                    label: "Player " + winningPlayername + " takes the cards.",
                    icon: this.gameModeImplementation.getIcon(),
                    visible: true,
                },
            }
        }

        var localPlayerNames = this.localizePlayernames(player);
        var localTableCards = this.localizeCards(player, "main");
        var lastStich = this.localizeCards(player, "last");
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
                localPlayerNames,
                localTableCards,
                lastStich,
            }
        );

        return [localGamestate, overallUIState];
    }

    sendGameStateAll() {
        console.log("sendGameStateAll()");
        this.room.getAllPlayers().forEach((player) => {
            var [localGamestate, overallUIState] = this.compilePlayerGamestate(player);
            if (player.client != null) {
                player.client.emit("coiffeur-gamestate", localGamestate, overallUIState);
                player.client.emit('debugInfo', localGamestate, overallUIState);
            };
        })
    }

    updateSeating() {
        var playerSeats = {};
        playerSeats["player0"] = this.room.getPlayerBySeat(0);
        playerSeats["player1"] = this.room.getPlayerBySeat(1);
        playerSeats["player2"] = this.room.getPlayerBySeat(2);
        playerSeats["player3"] = this.room.getPlayerBySeat(3);

        this.gameState.seatsAbsolute = playerSeats;
    }

    localizePlayernames(player) {
        const absSO = AbsoluteSeatNumbers();
        const absCO = AbsoluteSeatCompass();
        // [0, 1, 2, 3];
        const relSO = translateAbsToRel(absSO, player.getSeat(), this.gameState.status);
        // [1, 2, 3, 0] for player1
        var playerNames = {}
        for (var i = 0; i < 4; i++) {
            if (this.gameState.seatsAbsolute["player"+relSO[i]] != null) {
                playerNames[ absCO[i] ] = this.gameState.seatsAbsolute["player"+relSO[i]].getName()
            }
        }

        return playerNames;
    }
    localizeCards(player, boardType) {
        var tCD, winningPlayerSeat;
        if (boardType == "main" || boardType == null) {
            tCD = this.gameState.tableCardDeck;
            winningPlayerSeat = this.gameState.winningPlayerSeat;
        };
        if (boardType == "last" || boardType == null) {
            if (this.gameState.lastStich == null) {
                return null;
            }
            tCD = this.gameState.lastStich;
            winningPlayerSeat = tCD.winningPlayerSeat;
        };

        const absSO = AbsoluteSeatNumbers();
        const absCO = AbsoluteSeatCompass();
        // [0, 1, 2, 3];
        const relSO = translateAbsToRel(absSO, player.getSeat(), this.gameState.status);
        // [1, 2, 3, 0] for player1
        var cards = {}
        for (var i = 0; i < 4; i++) {
            if (tCD["player"+relSO[i]] != null) {
                var crtCard = tCD["player"+relSO[i]];
                cards[ absCO[i] ] = 
                crtCard != null
                    ? crtCard.renderName()
                    : null
                    ;
            }
        }
        
        const relCO = translateRelToAbs(absCO, player.getSeat(), this.gameState.status);

        cards.winner = relCO[winningPlayerSeat];

        return cards;
    }

    

    localizeSeating(player) {
        var allSeats = AbsoluteSeatOrder();
        switch (this.gameState.status) {
            case "PLAYER_SEATING":
                break
                
                default: // On purpose!
                console.warn("status " + status + " not explicitely defined");
            case "CHOOSE_TRICK":
            case "PLAY_ROUND":
            case "AWAIT_ENDROUND":
                localize = true;
                var seatNo = player.getSeat();
                arrayRotate(allSeats, -seatNo); // Reverse!
        }
        return allSeats;
    }

    /*compileSeating(player) {
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
    }*/

    sendGameState(player) {
        player.client.emit('coiffeur-gamestate', this.gameState);
    }

    /*
    UNUSED?
    emitAllPlayers(event, ...args) {
        this.room.getAllPlayers().forEach((player) => {
            player.emit(event, ...args);
        })
    }*/
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