import React from 'react';
import { Link } from 'react-router-dom';
import { makeSentenceCase } from './utils';

const TeamEntry = ({ id, entries, teamWinMap, teamCityName }) => {
  const entry = entries.find(entry => entry.id === id * 1)
  const totalScore = entry.selections.reduce((memo, team) => memo += teamWinMap[team], 0)
  if (!entry.id) return null;
  return (
    <div>
      <h2>Team Name: {makeSentenceCase(entry.teamName)}</h2>
      <h3>Total wins: {totalScore}</h3>
      <h3>Teams</h3>
      <ul className="list-group">
        {entry.selections.map(team => (
          <li className="list-group-item" key={team}>
            <Link to={`/teams/${team}`}>
              {teamCityName[team]}
            </Link>
            &nbsp;&nbsp;<span className="badge badge-secondary badge-pill">{`${teamWinMap[team]} ${teamWinMap[team] === 1 ? 'win' : 'wins'}`}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TeamEntry;
