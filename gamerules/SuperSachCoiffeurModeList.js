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
    ModeSlalom,
    ModeTannenbaum,
    ModeJoker,
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
            new ModeSlalom(7),
            new ModeTannenbaum(8),
            new Mode3x3(9),
            new ModeJoker(10),
        ])
    }
}


module.exports = SuperSachCoiffeurModelist;