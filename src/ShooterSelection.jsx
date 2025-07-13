import React from "react";

const ShooterSelection = ({
  activeShooterIndex,
  players,
  handleSetActiveShooter,
}) => {
  return (
    <div>
      <button
        onClick={() => handleSetActiveShooter(0)}
        style={{
          backgroundColor:
            activeShooterIndex === 0 ? players[1]?.color || "white" : "white",
        }}
      >
        {players[1]?.name || "Player 1"} Place Disc
      </button>
      <button
        onClick={() => handleSetActiveShooter(1)}
        style={{
          backgroundColor:
            activeShooterIndex === 1 ? players[2]?.color || "white" : "white",
        }}
      >
        {players[2]?.name || "Player 2"} Place Disc
      </button>
    </div>
  );
};

export default ShooterSelection;
