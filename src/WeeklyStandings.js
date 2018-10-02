import React from 'react';
import axios from 'axios';
import Entry from './Entry';
import Loading from './Loading';
import { makeSentenceCase, sortByScore, sortByName, weeks } from './utils';

class WeeklyStandings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isNameSorted: false,
      activeWeek: Number(this.props.history.location.search.split('=')[1]) || 1,
      winsPerEntry: [],
      error: ''
    }
    this.onChangeSortOrder = this.onChangeSortOrder.bind(this)
  }

  componentDidMount() {
    this.makeGamesCall(this.state.activeWeek)
  }

  makeGamesCall(gamesWeek) {
    this.setState({ winsPerEntry: [] })
    axios.get(`/api/games/weekly/regular/2018/${gamesWeek}`)
      .then(resp => resp.data)
      .then(schedule => schedule[0].games)
      .then(games => {
        const weeklyWinners = games.reduce((memo, game) => {
          if (game.score.awayScoreTotal > game.score.homeScoreTotal) {
            memo.push(game.schedule.awayTeam.abbreviation)
          }
          else if (game.score.awayScoreTotal < game.score.homeScoreTotal) {
            memo.push(game.schedule.homeTeam.abbreviation)
          }
          return memo
        }, [])
        const winsPerEntry = this.props.entries.reduce((memo, entry) => {
          const totalWins = entry.selections.reduce((winMemo, team) => {
            if (weeklyWinners.includes(team)) winMemo++
            return winMemo
          }, 0)
          memo.push({ id: entry.id, teamName: entry.teamName, entryScore: totalWins })
          return memo
        }, [])
        this.setState({ winsPerEntry })
      })
      .catch(error => this.setState({ error }))
  }

  onSelectWeek(week) {
    this.setState({ activeWeek: week })
    this.props.history.push(`/standings/weekly?week=${week}`)
    this.makeGamesCall(week)
  }

  onChangeSortOrder() {
    this.setState({ isNameSorted: !this.state.isNameSorted })
  }

  render() {
    const currentDate = new Date()
    const { isNameSorted, activeWeek, winsPerEntry, error } = this.state
    const { onChangeSortOrder } = this
    return (
      <div>
        <h2>Week {activeWeek} Standings</h2>
        <div className="grid grid-sort-btns">
          <h4>Sort by</h4>
          <button className="btn btn-warning button-font" disabled={isNameSorted} onClick={onChangeSortOrder}>Team Name</button>
          <button className="btn btn-warning button-font" disabled={!isNameSorted} onClick={onChangeSortOrder}>Score</button>
        </div>
        <ul className="nav nav-tabs margin-b-15">
          {
            weeks.map(week => (
              currentDate >= week.firstGame ? (
              <li key={week.number} className="nav-item">
                <span onClick={() => this.onSelectWeek(week.number)} className={`nav-link ${activeWeek === week.number && 'active font-weight-bold'}`}>
                  {week.text}
                </span>
              </li> ) : null
            ))
          }
        </ul>
        {error ? <h4>Network error. Please refresh.</h4> : (
          !winsPerEntry.length ? (<h2>Loading...</h2>) : (
            <div>
              <div className="grid grid-75-20">
                <div>
                  <h3>Team Name</h3>
                </div>
                <div>
                  <h3>Score</h3>
                </div>
              </div>
              {isNameSorted ? (
                winsPerEntry.sort(sortByName).map((entry, idx) => (
                  <Entry
                    key={entry.teamName}
                    makeSentenceCase={makeSentenceCase}
                    entry={entry}
                    rank={idx}
                    page={'weeklyStandings'}
                  />
                ))
              ) : (
                  winsPerEntry.sort(sortByScore).map((entry, idx) => (
                    <Entry
                      key={entry.teamName}
                      makeSentenceCase={makeSentenceCase}
                      entry={entry}
                      scoreSorted={true}
                      rank={idx}
                      page={'weeklyStandings'}
                    />
                  ))
                )
              }
            </div>
          )
        )}
      </div>
    )
  }
}

export default WeeklyStandings;
