class CoiffeurScores {
    constructor() {
        this.scores = {
            scoreLines: [
                {
                    icon: 'trumpC',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpH',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpS',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpK',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpD',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpU',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpA',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpT',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trump3',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
                {
                    icon: 'trumpJ',
                    scoreTeam1: null,
                    scoreTeam2: null,
                },
            ],
            totalTeam1: 0,
            totalTeam2: 0,
            team1Name: 'Team 1',
            team2Name: 'Team 2',
            mode: "Coiffeur",
        };
    }

    updateScore(index, scoreObject) {
        this.scores.scoreLines[index] = Object.assign(
            this.scores.scoreLines[index],
            scoreObject
        );

        this.updateTotals();
    }

    updateTotals() {
        this.scores.totalTeam1 = 
            this.scores.scoreLines.reduce( (acc, currentValue, index) => {
                var multiplier = index + 1;
                return acc + (currentValue.scoreTeam1 * multiplier);
            }, 0);
        this.scores.totalTeam2 = 
            this.scores.scoreLines.reduce( (acc, currentValue, index) => {
                var multiplier = index + 1;

                return acc + (currentValue.scoreTeam2 * multiplier);
            }, 0);
    }

    updateTeamname(oneOrTwo, teamname) {
        this.scores["team" + oneOrTwo + "Name"] = teamname;
    }

    render() {
        this.updateTotals();
        return Object.assign({}, this.scores);
    }
}

module.exports = CoiffeurScores;