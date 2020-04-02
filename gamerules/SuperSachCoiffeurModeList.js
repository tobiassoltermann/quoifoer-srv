const Mode = require('./coiffeurmodes/Mode');
const ModeList = require('./coiffeurmodes/ModeList');

class SuperSachCoiffeurModelist extends ModeList {
    constructor() {
        super();

        super.addModeAll([
            new Mode("CLUBS", 1, "trumpC"),
            new Mode("HEARTS", 2, "trumpH"),
            new Mode("SPADES", 3, "trumpS"),
            new Mode("DIAMOND", 4, "trumpK"),
            new Mode("DOWN", 5, "trumpD"),
            new Mode("UP", 6, "trumpU"),
            new Mode("SLALOM", 7, "trumpA"),
            new Mode("TANNENBAUM", 8, "trumpT"),
            new Mode("3x3", 9, "trump3"),
            new Mode("JOKER", 10, "trumpJ"),
        ])
    }
}


module.exports = SuperSachCoiffeurModelist;