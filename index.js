const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const cors = require('cors');
const app = express();

app.use(cors());

const server = http.createServer(app);
const io = socketIo(server);
const startTimestamp = Date.now();

const OFFERED_GAMEMODES = {
    coiffeur: {
        label: 'Coiffeur'
    },
    schieber: {
        label: 'Schieber'
    }
};

/**
 * nodemon index.js
 */

players = {};
rooms = [];

gamestate = {

};
class RoomList {
    constructor() {
        this.MAX_PLAYERS_PER_ROOM = 4;
        this.rooms = {};
    }

    addRoom(roomDetails) {
        if (!this.rooms.hasOwnProperty(roomDetails.name)) {
            // Room doesn't exist
            this.rooms[roomDetails.name] = {
                name: roomDetails.name,
                protection: roomDetails.protection,
                playerCount: 0,
                playerMax: this.MAX_PLAYERS_PER_ROOM,
            };
            return true;
        } else {
            // Room already exists
            return false;
        }
        
    }

    joinRoom(roomName) {
        const thisRoom = this.rooms[roomName];
        if (thisRoom.playerCount < thisRoom.playerMax) {
            this.rooms[roomName].playerCount++;
            return true;
        } else {
            return false;
        }
    }

    leaveRoom(roomName) {
        const thisRoom = this.rooms[roomName];
        if (thisRoom.playerCount > 0) {
            this.rooms[roomName].playerCount--;
            return true;
        } else {
            return false;
        }
    }

    getList() {
        var roomListOrig = this.rooms;
        var roomListSendable = Object.values(roomListOrig).map( (currentRoom) => {
            return {
                name: currentRoom.name,
                protection: currentRoom.protection,
                playerCount: currentRoom.playerCount,
                playerMax: currentRoom.playerMax,
            }
        });
        return roomListSendable;
    }

}

class GameServer {
    constructor() {
        this.debugInfo = {};
        this.roomList = new RoomList();

        io.on("startgame", () => {
        });
        io.on('connection', this.handleNewConnection.bind(this));
    }

    handleNewConnection(client) {
        this.sendRoomListAll();
        this.sendOfferedGameRules(client);

        client.on("providename", (name) => {
            players[name] = {
                client: client
            };
    
        });
        client.on("createRoom", (roomDetails) => {
            var roomAddResult = this.roomList.addRoom(roomDetails);
            this.sendRoomListAll();
        });
        client.on("joinRoom", (roomName, response) => {
            var couldJoin = this.roomList.joinRoom(roomName);
            client.join(roomName);
            this.sendRoomListAll();
            response(couldJoin);
            setTimeout(()=>{
                io.to(roomName).emit('hello');
            }, 2000);
        });
        client.on("leaveRoom", (roomName, response) => {
            console.warn("leaveRoom");
            var couldLeave = this.roomList.leaveRoom(roomName);
            client.leave(roomName);
            this.sendRoomListAll();
            response(couldLeave);
        });

        this.scheduleDebugInfo(client, true);
    }

    scheduleDebugInfo(client, reschedule) {
        this.debugInfo.timer = (Date.now() - startTimestamp);
        this.debugInfo.rooms = this.roomList.getList();
        client.emit('debugInfo', this.debugInfo);
        if (reschedule) {
            var _this = this;
            setTimeout(()=> {
                this.scheduleDebugInfo.bind(_this)(client, true);
            }, 3000);
        }
    }

    sendOfferedGameRules(client) {
        client.emit('offered-gamemodes', OFFERED_GAMEMODES);
    }
    sendRoomListAll() {
        io.emit('rooms', this.roomList.getList());
    }
}

let gameServer = new GameServer()

  
server.listen(4000, function(){
    console.log('listening on *:3000');
});
