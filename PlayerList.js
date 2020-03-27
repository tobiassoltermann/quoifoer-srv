const Player = require('./Player');

class PlayerList {
    constructor() {
        this.players = []; // of class Player
    }

    addPlayer(playerName, client) {
        var existingPlayerIndex = this.findIndexByName(playerName);
        if (existingPlayerIndex == -1) {
            // Player does not exist, add.
            var player = new Player(client, playerName);
            this.players.push(player);
            client.on('disconnect', () => {
                // When detecting a disconnect, remove socket
                this.players.client = null;
            });
            return {
                status: true,
                player: player,
            };
        } else {
            var existingPlayer = this.players[existingPlayerIndex];
            if (existingPlayer.getSeat() != null && existingPlayer.client == null) {
                // Player exists and socket is stale. Reassign socket.
                this.players.client = client;
                return {
                    status: true,
                    player: existingPlayer
                }
            } else {
                // Present, but is unseated.
                return {
                    status: false,
                    message: "unseated player already there",
                }
            }
        }
    }
    getPlayerByName(playerName) {
        var existingPlayerIndex = this.findIndexByName(playerName);
        return this.players[existingPlayerIndex];
    }

    getPlayerBySeat(seatNo) {
        return this.players.findIndex( (player) => { return player.seat == seatNo } );

    }

    removePlayerByClient(playerName, client) {
        var existingPlayerIndex = this.findByClient(client);
        if (existingPlayerIndex != -1 ) {
            this.players.splice(existingPlayerIndex,1);
        }
        return {
            status: true
        };
    }

    removePlayerByName(playerName) {
        var existingPlayerIndex = this.findIndexByName(playerName);
        if (existingPlayerIndex != -1) {
            this.players.splice(existingPlayerIndex,1);
        }
        return {
            status: true
        };
    }

    findIndexByName(name) {
        return this.players.findIndex( (player) => { return player.name == name } );
    }

    findIndexByClient(client) {
        return this.players.findIndex( (player) => { return player.client == client} );
    }

    getTotalNumber() {
        return this.players.length;
    }

    getTotalNumberSeated() {
        return this.players.filter( (player) => { return player.seat == false } ).length;
    }

    getTotalNumberUnseated() {
        return this.players.filter( (player) => {return player.seat == true } ).length;
    }

    getAllPlayers() {
        return this.players;
    }
}

module.exports = PlayerList;