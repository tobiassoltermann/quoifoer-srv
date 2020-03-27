const CoiffeurImplementation = require('./gamerules/CoiffeurImplementation');

AvailableGamemodes = {
    coiffeur: {
        label: 'Coiffeur',
        implementation: CoiffeurImplementation,
    },
    schieber: {
        label: 'Schieber',
        implementation: null,
    }
};

module.exports = AvailableGamemodes;