const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const cors = require('cors');
const app = express();

app.use(cors());

const server = http.createServer(app);
const io = socketIo(server);
const startTimestamp = Date.now();

const RoomList = require('./RoomList');
const Room = require('./Room');

const AvailableGamemodes = require('./AvailableGamemodes');

/**
 * nodemon index.js
 */

players = {};
rooms = [];

gamestate = {

};


class GameServer {
    constructor() {
        this.debugInfo = {};
        this.roomList = new RoomList(this);

        io.on("startgame", () => {
        });
        io.on('connection', this.handleNewConnection.bind(this));
    }

    handleNewConnection(client) {
        console.log("on connection");
        this.sendRoomListAll();
        this.sendOfferedGameRules(client);

        var playerName;
        client.on("providename", (name) => {
            console.log("providename", name);
            playerName = name;
            
        });
        client.on("createRoom", (roomDetails, confirmation) => {
            var roomAddResult = this.roomList.addRoom(roomDetails);
            confirmation(roomAddResult);
            if (roomAddResult.status) {
                this.sendRoomListAll();
            };
        });
        client.on("joinRoom", (roomName, response) => {
            var couldJoin = this.roomList.joinRoom(roomName, client, playerName);
            console.log("joinRoom Done");
            var result = {
                status: couldJoin.status,
                message: couldJoin.message,
            };
            console.log(result);
            var room = this.roomList.getRoom(roomName);

            response(result, {
                gameMode: room.gameMode,
            });
            if (couldJoin.status) {
                this.sendRoomListAll();
            }
        });
        client.on("leaveRoom", (roomName, response) => {
            console.warn("leaveRoom");
            var couldLeave = this.roomList.leaveRoom(roomName, playerName);
            response({
                status: couldLeave.status,
                message: couldLeave.message,
            });
            console.log()
            if (couldLeave.status) {
                this.sendRoomListAll();
            }
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
        var gameModesSendable = {};
        Object.keys(AvailableGamemodes).forEach( (keyName) => {
            gameModesSendable[keyName] = {
                label: AvailableGamemodes[keyName].label
            }
        });
        client.emit('offered-gamemodes', gameModesSendable);
    }
    sendRoomListAll() {
        io.emit('rooms', this.roomList.getList());
    }
}

let gameServer = new GameServer()

  
server.listen(4000, function(){
    console.log('listening on *:3000');
});
