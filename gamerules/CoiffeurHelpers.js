const Card = require('./Card');


function getTeamBySeat (seat) {
    switch (seat) {
        case 0:
        case 2:
            return 1;
        case 1:
        case 3:
            return 2;
        default:
            return -1;
    }
}

function shortenPlayername(name) {
    if (name == null) return "?";
    return name.substring(0, 2);
}

function createTeamNames(player1, player2) {
    return shortenPlayername(player1) + "+" + shortenPlayername(player2);
}

function getSeatOrderMechanism(status, player) {
    switch (status) {
        case "PLAYER_SEATING":
            return AbsoluteSeatOrder();
        case "CHOOSE_TRICK":
        case "PLAY_ROUND":
            return RelativeSeatOrder(player);

        default:
            console.warn("status " + status + " not explicitely defined");
            return RelativeSeatOrder(player);
    }
}

function getCompassBySeat(seatID) {
    return AbsoluteSeatOrder()[seatID];
}

function createPlayerSeats() {
    return {
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
    }
}

function AbsoluteSeatOrder() {
    return ['S', 'E', 'N', 'W']
};


function arrayRotate(arr, count) {
    count -= arr.length * Math.floor(count / arr.length);
    arr.push.apply(arr, arr.splice(0, count));
    return arr;
}
function RelativeSeatOrder(player) {
    var allSeats = AbsoluteSeatOrder();
    var seatNo = player.getSeat();
    arrayRotate(allSeats, -seatNo); // Reverse!
    return allSeats;
}

function getNullCard() {
    return new Card("N", "N");
}



module.exports = {
    getTeamBySeat,
    shortenPlayername,
    createTeamNames,
    createPlayerSeats,
    getSeatOrderMechanism,
    getCompassBySeat,
    AbsoluteSeatOrder,
    RelativeSeatOrder,
    getNullCard,
    arrayRotate,
}