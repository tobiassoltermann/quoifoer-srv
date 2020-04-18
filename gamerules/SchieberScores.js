class SchieberScores {
    constructor(modes) {
        this.modes = modes;
        this.scores = {
            scoreLines: this.modes.allModes().map( (crtMode) => {
                var crtScoreline = {
                    icon: crtMode.getIcon(),
                    scoreTeam1: null,
                    scoreTeam2: null,
                }
                if (crtMode.hasSubselector()) {
                    crtScoreline.subselectorName = crtMode.getSubselectorName();
                }
                return crtScoreline;
            }),
            totalTeam1: 0,
            totalTeam2: 0,
            team1Name: 'Team 1',
            team2Name: 'Team 2',
            mode: "Schieber",
        }
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

module.exports = SchieberScores;