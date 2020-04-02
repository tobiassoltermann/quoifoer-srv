class ModeList {
    constructor() {
        this.modes = {}
    }

    addMode(mode) {
        this.modes[mode.name] = mode;
    }

    addModeAll(list) {
        list.forEach((mode) => {
            this.addMode(mode)
        });
    }
    isCardPlayable(){
        
    }

    length() { 
        return this.modes.length;
    }
}

module.exports = ModeList;