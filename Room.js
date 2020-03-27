const PlayerList = require('./PlayerList');

const AvailableGamemodes = require('./AvailableGamemodes');

class Room {

    constructor(gameServer, roomDetails) {
        this.gameServer = gameServer;

        this.name = roomDetails.name;
        this.protection = roomDetails.protection;
        this.players = new PlayerList();
        this.gameMode = roomDetails.gameMode;
        this.gameRuleEngine = new AvailableGamemodes[roomDetails.gameMode].implementation();
    }

    playerCount() {
        return this.players.getTotalNumber();
    }

    maxPlayers() {
        return this.gameRuleEngine.maxPlayers();
    }

    join(client, playerName) {
        console.log("Room.join:", playerName);
        var status = this.players.addPlayer(playerName, client);
        return status;
    }

    leave(playerName) {
        var status = this.players.removePlayerByName(playerName);
        status.remainingPlayerNo = this.players.getTotalNumber();
        return status;
    }

}

module.exports = Room;