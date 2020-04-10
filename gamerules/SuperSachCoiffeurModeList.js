const Mode = require('./coiffeurmodes/Mode');
const ModeList = require('./coiffeurmodes/ModeList');

const {
    Mode3x3,
    ModeHearts,
    ModeClubs,
    ModeSpades,
    ModeDiamonds,
    ModeUp,
    ModeDown,
} = require('./coiffeurmodes/AllModes');

class SuperSachCoiffeurModelist extends ModeList {
    constructor() {
        super();

        super.addModeAll([
            new ModeClubs(1),
            new ModeHearts(2),
            new ModeSpades(3),
            new ModeDiamonds(4),
            new ModeDown(5),
            new ModeUp(6),
            new Mode("SLALOM", 7, "trumpA"),
            new Mode("TANNENBAUM", 8, "trumpT"),
            //new Mode("3x3", 9, "trump3"),
            new Mode3x3(9),
            new Mode("JOKER", 10, "trumpJ"),
        ])
    }
}


module.exports = SuperSachCoiffeurModelist;