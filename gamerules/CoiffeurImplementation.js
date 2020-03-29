
const Card = require('./Card');
const CardSet = require('./CardSet');
const CoiffeurCardSet = require('./CoiffeurCardSet');

class Round {

}

const AbsoluteSeatOrder = ['S', 'E', 'N', 'W'];

class CoiffeurScores {
    constructor() {
        this.scores = {
            scoreLines: [
                {
                    icon: 'trumpC',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpH',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpS',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpK',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpD',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpU',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpA',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpT',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trump3',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpJ',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
            ],
            totalTeam1: 0,
            totalTeam2: 0,
            team1Name: 'Team 1',
            team2Name: 'Team 2',
            mode: "Coiffeur",
        };
    }

    updateScore(index, scoreObject) {
        this.scores.scoreLines[index] = Object.assign(
            this.scores.scoreLines[index],
            scoreObject
        );

        this.updateTotals();
    }

    updateTotals() {
        this.scores.totalTeam1 = 
            this.scores.scoreLines.reduce( (acc, currentValue) => {
                console.log(acc, currentValue.scoreTeam1);
                return acc + currentValue.scoreTeam1;
            }, 0);
        this.scores.totalTeam2 = 
            this.scores.scoreLines.reduce( (acc, currentValue) => {
                console.log(acc, currentValue.scoreTeam2);
                return acc + currentValue.scoreTeam2;
            }, 0);
    }

    updateTeamname(oneOrTwo, teamname) {
        this.scores["team" + oneOrTwo + "Name"] = teamname;
    }

    render() {
        this.updateTotals();
        return Object.assign({}, this.scores);
    }
}

class CoiffeurGamerules {
    constructor(room) {
        this.room = room;
        this.scoresObject = new CoiffeurScores();
        console.log(room.name);
        this.gameState = {
            status: "PLAYER_SEATING",
            scores: this.scoresObject.render(),
            cardSet: CoiffeurCardSet,
            playerCardDecks: {
                player0: {},
                player1: {},
                player2: {},
                player3: {},
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
            var seatNo = AbsoluteSeatOrder.findIndex((crtSeatname) => { return seatName == crtSeatname });
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
            this.sendGameStateAll();
        });

        player.client.on('coiffeur-unseat', (response) => {
            player.unSeat();
            this.sendGameStateAll();
        })

    }

    // Must implement!
    onPlayerLeave(player) {
        player.unSeat();
        this.sendGameStateAll();
    }

    compilePlayerGamestate(player) {
        // TODO: Implement recursive Object.assign of this.gameState.seatsAbsolute and Cards

        var boardSetup =
            Object.assign({},
                this.gameState.seatsAbsolute,
            );

        boardSetup.S.card = "NN";
        boardSetup.E.card = "NN";
        boardSetup.N.card = "NN";
        boardSetup.W.card = "NN";
        boardSetup.self = AbsoluteSeatOrder[player.getSeat()];

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
        // TODO: Change PLAYER_SEATING to new "select trumpf" status.

        if (this.gameState.status == "PLAYER_SEATING" && yourTeam > 0) {
            scores.scoreLines = scores.scoreLines.map( (scoreLine) => {
                const myScoreOnLine = scoreLine["scoreTeam" + yourTeam];
                return Object.assign(
                    scoreLine,
                    { selectable: (myScoreOnLine == null)}
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

        var localGamestate = {
            gameStatus: this.gameState.status,
            yourTeam: yourTeam,
            scores: scores,
            cardDeck: this.gameState["playerCardDecks" + player.getSeat()],
            boardSetup,
        };
        return localGamestate;
    }

    sendGameStateAll() {
        this.room.getAllPlayers().forEach((player) => {
            this.compileGlobalSeats();
            var localGamestate = this.compilePlayerGamestate(player);
            console.log("sendGameStateAll", "localGamestate", localGamestate);
            player.client.emit("coiffeur-gamestate", localGamestate);
            player.client.emit('debugInfo', localGamestate);
        })
    }

    compileGlobalSeats() {
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
            var absoluteSeatIndex = player.getSeat();
            if (absoluteSeatIndex == null) {
                return; // Unseated player.
            }
            /*if (playerSeats[AbsoluteSeatOrder[absoluteSeatIndex]] != null) {
                console.log("Double seat! ", player.getName());
                return;
            }*/
            playerSeats[AbsoluteSeatOrder[absoluteSeatIndex]].playerName = player.getName();
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