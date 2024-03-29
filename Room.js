const PlayerList = require('./PlayerList');

const AvailableGamemodes = require('./AvailableGamemodes');

class Room {

    constructor(gameServer, roomDetails) {
        this.gameServer = gameServer;

        this.name = roomDetails.name;
        this.protection = roomDetails.protection;
        this.password = roomDetails.passwd;
        this.players = new PlayerList();
        this.gameMode = roomDetails.gameMode;
        this.gameRuleEngine = new AvailableGamemodes[roomDetails.gameMode].implementation(this);
    }

    playerCount() {
        return this.players.getTotalNumber();
    }

    maxPlayers() {
        return this.gameRuleEngine.maxPlayers();
    }

    join(client, playerName, password) {
        var authCorrect = false;
        var status;
        if (this.protection == "none" || this.protection == "passwd" && this.password == password) {
            status = this.players.addPlayer(playerName, client);
            if (status.status) {
                var newPlayer = this.players.getPlayerByName(playerName);
                this.gameRuleEngine.onPlayerJoin(newPlayer)
            } else {
                return status;
            }
        } else {
            status = {
                status: false,
                message: 'Wrong password',
            }
        }
        return status;
    }

    leave(playerName) {
        var existingPlayer = this.players.getPlayerByName(playerName);
        var status = this.players.removePlayerByName(playerName);
        status.remainingPlayerNo = this.players.getTotalNumber();
        this.gameRuleEngine.onPlayerLeave(existingPlayer);
        return status;
    }

    getTotalNumberSeated() {
        return this.players.getTotalNumberSeated();
    }

    getPlayerBySeat(seatNo) {
        return this.players.getPlayerBySeat(seatNo);
    }

    getAllPlayers() {
        return this.players.getAllPlayers();
    }

    getAllSeatedPlayers() {
        return this.players.getAllSeatedPlayers();
    }
}

module.exports = Room;