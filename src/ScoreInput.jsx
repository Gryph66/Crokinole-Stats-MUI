import React from "react";

const ScoreInput = ({
  players,
  scores,
  handleScoreChange,
  handleEndRoundSubmit,
  calculateTotalTwenties,
  calculateTotalPoints,
  roundNumber,
}) => {
  return (
    <div>
      <h3>Enter Scores for Round {roundNumber}</h3>
      <div>
        <label style={{ color: players[1]?.color || "black" }}>
          {players[1]?.name || "Player 1"} 20's Scored:
        </label>
        <input
          type="text"
          name={`1_twenties`}
          value={scores[1]?.twenties !== undefined ? scores[1].twenties : ""}
          onChange={handleScoreChange}
        />
      </div>
      <div>
        <label style={{ color: players[2]?.color || "black" }}>
          {players[2]?.name || "Player 2"} 20's Scored:
        </label>
        <input
          type="text"
          name={`2_twenties`}
          value={scores[2]?.twenties !== undefined ? scores[2].twenties : ""}
          onChange={handleScoreChange}
        />
      </div>
      <div>
        <label style={{ color: players[1]?.color || "black" }}>
          {players[1]?.name || "Player 1"} Points:
        </label>
        <input
          type="text"
          name={`1_points`}
          value={scores[1]?.points !== undefined ? scores[1].points : ""}
          onChange={handleScoreChange}
        />
      </div>
      <div>
        <label style={{ color: players[2]?.color || "black" }}>
          {players[2]?.name || "Player 2"} Points:
        </label>
        <input
          type="text"
          name={`2_points`}
          value={scores[2]?.points !== undefined ? scores[2].points : ""}
          onChange={handleScoreChange}
        />
      </div>
      <div>
        <p>Total 20's Scored: {calculateTotalTwenties()}</p>
        <p>Total Points: {calculateTotalPoints()}</p>
      </div>
      <button onClick={handleEndRoundSubmit}>Submit Round Scores</button>
    </div>
  );
};

export default ScoreInput;