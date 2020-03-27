const Room = require('./Room');

class RoomList {
    constructor(gameServer) {
        this.rooms = {};
        this.gameServer = gameServer;
    }

    addRoom(roomDetails) {
        if (!this.rooms.hasOwnProperty(roomDetails.name)) {
            this.rooms[roomDetails.name] = new Room(this.gameServer, roomDetails);
            return {
                status: true,
            };
        } else {
            // Room already exists
            return {
                status: false,
                message: "Room with the same name already exists",
            };
        }
        
    }
    removeRoom(roomName) {
        delete this.rooms[roomName];
    }

    getRoom(roomName) {
        return this.rooms[roomName];
    }

    joinRoom(roomName, client, playerName) {
        console.log("RoomList.joinRoom:", roomName, playerName);
        const thisRoom = this.rooms[roomName];
        return thisRoom.join(client, playerName);
    }

    leaveRoom(roomName, playerName) {
        console.log("leaveRoom");
        const thisRoom = this.rooms[roomName];
        var status = thisRoom.leave(playerName);
        if (status.remainingPlayerNo <= 0) {
            console.log("removeRoom");
            this.removeRoom(roomName);
        }
        delete status.remainingPlayerNo;
        return status;
    }

    getList() {
        var roomListOrig = this.rooms;
        var roomListSendable = Object.values(roomListOrig).map( (currentRoom) => {
            return {
                name: currentRoom.name,
                protection: currentRoom.protection,
                playerCount: currentRoom.playerCount(),
                playerMax: currentRoom.maxPlayers(),
                gameMode: currentRoom.gameMode,
            }
        });
        return roomListSendable;
    }

}

module.exports = RoomList;