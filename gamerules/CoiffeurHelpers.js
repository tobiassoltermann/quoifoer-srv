const Card = require('./Card');


function getTeamBySeat(seat) {
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

function createEmptyPlayerSeats() {
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

function arrayRotate(arr, count) {
    count -= arr.length * Math.floor(count / arr.length);
    arr.push.apply(arr, arr.splice(0, count));
    return arr;
}


function AbsoluteSeatCompass() {
    return ['S', 'E', 'N', 'W']
}
function AbsoluteSeatNumbers() {
    return [0, 1, 2, 3];
}

function translateAbsToRel(absArr, seatNo, status) {
    var relArr = absArr.slice();
    switch (status) {
        case "PLAYER_SEATING":
            break; // Do nothing

        default: // On purpose!
            console.warn("status " + status + " not explicitely defined");
        case "CHOOSE_TRICK":
        case "AWAIT_ENDROUND":
        case "PLAY_ROUND":
            arrayRotate(relArr, seatNo)
    }

    return relArr;
}

function translateRelToAbs(relArr, seatNo, status) {
    var absArr = relArr.slice();
    switch (status) {
        case "PLAYER_SEATING":
            break; // Do nothing

        default: // On purpose!
            console.warn("status " + status + " not explicitely defined");
        case "CHOOSE_TRICK":
        case "AWAIT_ENDROUND":
        case "PLAY_ROUND":
            arrayRotate(absArr, -seatNo)
    }

    return absArr;
}

function getNullCard() {
    return new Card("N", "N");
}



module.exports = {
    getTeamBySeat,
    shortenPlayername,
    createTeamNames,
    createEmptyPlayerSeats,

    getNullCard,
    arrayRotate,

    AbsoluteSeatCompass,
    AbsoluteSeatNumbers,
    translateAbsToRel,
    translateRelToAbs,
        
    
}