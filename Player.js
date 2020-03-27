
class Player {
    constructor (client, name) {
        this.client = client;
        this.name = name;
        this.seat = null;
    }

    getClient() {
        return this.client;
    }
    getName() {
        return this.name;
    }
    assignSeat(seat) {
        this.seat = seat;
    }
    unSeat() {
        this.seat = null;
    }

    getSeat(seat) {
        return this.seat;
    }

}

module.exports = Player;