
const Card = require('./Card');
const CardSet = require('./CardSet');
const CoiffeurScores = require('./CoiffeurScores');
const CoiffeurCardSet = require('./CoiffeurCardSet');
const ClosedCardSet = require('./ClosedCardSet');
const RoundManager = require('./RoundManager');
const SuperSachCoiffeurModeList = require('./SuperSachCoiffeurModeList');


const AbsoluteSeatOrder = () => ['S', 'E', 'N', 'W'];
const RelativeSeatOrder = (player) => {
    function arrayRotate(arr, count) {
        count -= arr.length * Math.floor(count / arr.length);
        arr.push.apply(arr, arr.splice(0, count));
        return arr;
    }

    var allSeats = AbsoluteSeatOrder();
    var seatNo = player.getSeat();
    arrayRotate(allSeats, -seatNo); // Reverse!
    return allSeats;
}



class CoiffeurGamerules {
    constructor(room) {
        console.log("CoiffeurGamerules::constructor");
        this.modes = new SuperSachCoiffeurModeList();
        this.room = room;
        this.roundManager = new RoundManager(this);
        this.scoresObject = new CoiffeurScores();
        this.cardSet = new CoiffeurCardSet();

        this.gameState = {
            status: "PLAYER_SEATING",
            scores: this.scoresObject.render(),
/*            playerCardDecks: {
                player0: ClosedCardSet(9),
                player1: ClosedCardSet(9),
                player2: ClosedCardSet(9),
                player3: ClosedCardSet(9),
            },
*/
            playerCardDecks: {
                player0: new CardSet(),
                player1: new CardSet(),
                player2: new CardSet(),
                player3: new CardSet(),
            },
            seatsAbsolute: {

            },
            tableCardDeck: {

            }
        };
    }

    // Must implement!
    onPlayerJoin(player) {
        console.log("join", player.getName());
        player.client.on('coiffeur-requestgamestate', () => {
            console.log(this.gameState);
            this.sendGameStateAll();
        })

        player.client.on('coiffeur-seat', (seatName, response) => {
            var seatNo = AbsoluteSeatOrder().findIndex((crtSeatname) => { return seatName == crtSeatname });
            if (seatNo == -1) {
                response({
                    status: false,
                    message: "Seat " + seatName + " doesn't exist"
                });
                return;
            }
            if (this.room.getPlayerBySeat(seatNo) == null) {
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
            var allSeatsOccupied = [0, 1, 2, 3].map((i) => { return this.room.getPlayerBySeat(i) }).every((p) => { return p != null });
            if (allSeatsOccupied) {
                this.beginRound(false);
            }
            this.sendGameStateAll();
        });

        player.client.on('coiffeur-unseat', (response) => {
            player.unSeat();
            this.sendGameStateAll();
        })

    }

    beginRound(updateClients) {
        this.roundManager.beginRound();

        if (updateClients) {
            this.sendGameStateAll();
        }
    }

    // Must implement!
    onPlayerLeave(player) {
        player.unSeat();
        this.sendGameStateAll();
    }

    compilePlayerGamestate(player) {
        this.compileSeating(player);

        var boardSetup =
            Object.assign({},
                this.gameState.seatsAbsolute,
            );

        boardSetup.S.card = "NN";
        boardSetup.E.card = "NN";
        boardSetup.N.card = "NN";
        boardSetup.W.card = "NN";
        boardSetup.self = AbsoluteSeatOrder()[player.getSeat()];

        var yourTeam = (() => {
            switch (player.getSeat()) {
                case 0:
                case 2:
                    return 1;
                case 1:
                case 3:
                    return 2;
                default:
                    return -1;
            }
        })()

        var scores = this.scoresObject.render();

        if (this.gameState.status == "CHOOSE_TRICK" && yourTeam > 0) {
            scores.scoreLines = scores.scoreLines.map((scoreLine) => {
                const myScoreOnLine = scoreLine["scoreTeam" + yourTeam];
                return Object.assign(
                    scoreLine,
                    { selectable: (myScoreOnLine == null) }
                )
            })
        };

        const teamNames = (player1, player2) => {
            const shortenPlayername = (name) => {
                if (name == null) return "?";
                return name.substring(0, 2);
            }
            return shortenPlayername(player1) + "+" + shortenPlayername(player2);
        }
        scores.team1Name = teamNames(boardSetup.N.playerName, boardSetup.S.playerName);
        scores.team2Name = teamNames(boardSetup.W.playerName, boardSetup.E.playerName);
        console.log(player.getSeat());

        var localGamestate = {
            gameStatus: this.gameState.status,
            yourTeam: yourTeam,
            scores: scores,
            cardDeck:
                (player.getSeat() != null && player.getSeat() >= 0)
                    ? this.gameState.playerCardDecks["player" + player.getSeat()].render()
                    : []
            ,
            boardSetup,
        };

        var overallUIState;
        if (this.gameState.status == "PLAYER_SEATING") {
            overallUIState = {
                statusText: {
                    label: "Welcome, please take a seat. Once the 4th joins, the game starts",
                    icon: null,
                    visible: true
                },
            }
        };
        if (this.gameState.status == "CHOOSE_TRICK") {
            overallUIState = {
                statusText: {
                    label: "Choose trick, or push.",
                    icon: null,
                    visible: true
                },
            }
        };
        return [localGamestate, overallUIState];
    }

    sendGameStateAll() {
        this.room.getAllPlayers().forEach((player) => {
            var [localGamestate, overallUIState] = this.compilePlayerGamestate(player);
            console.log("sendGameStateAll", "localGamestate", localGamestate, overallUIState);
            player.client.emit("coiffeur-gamestate", localGamestate, overallUIState);
            player.client.emit('debugInfo', localGamestate, overallUIState);
        })
    }

    compileSeating(player) {
        var SeatOrderMechanism = (() => {
            switch (this.gameState.status) {
                case "PLAYER_SEATING":
                    return AbsoluteSeatOrder();
                case "CHOOSE_TRICK":
                    return RelativeSeatOrder(player);
            }
        })();
        var playerSeats = {
            S: {
                playerName: null,
            },
            E: {
                playerName: null,
            },
            N: {
                playerName: null,
            },
            W: {
                playerName: null,
            },
        };

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
            player0: shuffledCards.slice(0, 9),
            player1: shuffledCards.slice(9, 18),
            player2: shuffledCards.slice(18, 27),
            player3: shuffledCards.slice(27, 36),
        };
        this.sendGameStateAll();
    }

    maxPlayers() {
        return 4;
    }
}

//CoiffeurGamerules.Status = Status;
module.exports = CoiffeurGamerules;