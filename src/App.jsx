import React, { useState } from "react";
import MetadataForm from "./MetadataForm";
import BoardState from "./BoardState";
import theme from './theme';
import { ThemeProvider } from '@mui/material/styles';

const App = () => {
  const [metadata, setMetadata] = useState(null);
  const [rounds, setRounds] = useState([
    {
      roundNumber: 1,
      shots: [],
      scores: {
        1: { name: "", twenties: 0, points: 0 },
        2: { name: "", twenties: 0, points: 0 },
      },
    },
  ]);
  const [currentRound, setCurrentRound] = useState(1);
  const [shots, setShots] = useState({ 0: 0, 1: 0 });
  const [startingPlayer, setStartingPlayer] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const handleMetadataSubmit = (data) => {
    if (data.players && data.players["1"] && data.players["2"]) {
      setMetadata({
        ...data,
        players: {
          1: data.players["1"],
          2: data.players["2"],
        },
      });

      setRounds([
        {
          roundNumber: 1,
          shots: [],
          scores: {
            1: { name: data.players["1"].name, twenties: 0, points: 0 },
            2: { name: data.players["2"].name, twenties: 0, points: 0 },
          },
        },
      ]);
    } else {
      console.error("Invalid players data:", data.players);
    }
  };

  const handleSaveShot = (shotData) => {
    setRounds((prevRounds) => {
      const updatedRounds = [...prevRounds];
      const currentRoundIndex = updatedRounds.findIndex(
        (round) => round.roundNumber === currentRound,
      );
      updatedRounds[currentRoundIndex].shots.push(shotData);
      return updatedRounds;
    });

    setShots((prevShots) => {
      const updatedShots = { ...prevShots };
      updatedShots[shotData.playerIndex] += 1;
      return updatedShots;
    });
  };

  const handleEndRound = (scores) => {
    setRounds((prevRounds) => {
      const updatedRounds = [...prevRounds];
      const currentRoundIndex = updatedRounds.findIndex(
        (round) => round.roundNumber === currentRound,
      );
      updatedRounds[currentRoundIndex].scores = scores;
      return updatedRounds;
    });
    const nextStartingPlayer = startingPlayer === 0 ? 1 : 0;
    setCurrentRound((prevRound) => prevRound + 1);
    setRounds((prevRounds) => [
      ...prevRounds,
      {
        roundNumber: currentRound + 1,
        shots: [],
        scores: {
          1: { name: metadata.players[1].name, twenties: 0, points: 0 },
          2: { name: metadata.players[2].name, twenties: 0, points: 0 },
        },
      },
    ]);
    setShots({ 0: 0, 1: 0 });
    setStartingPlayer(nextStartingPlayer);
  };

  const handleGameOver = () => {
    setGameOver(true);
    exportToJSON();
  };

  const exportToJSON = () => {
    // Filter out the last round if it's empty
    const filteredRounds = rounds.filter((round, index) => {
      return index === rounds.length - 1 ? round.shots.length > 0 : true;
    });

    const blob = new Blob(
      [JSON.stringify({ metadata, rounds: filteredRounds }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crokinole_game_data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        {!metadata && <MetadataForm onSubmit={handleMetadataSubmit} />}
        {metadata && (
          <>
            <BoardState
              onSaveShot={handleSaveShot}
              players={metadata.players}
              roundNumber={currentRound}
              shots={shots}
              startingPlayer={startingPlayer}
              setStartingPlayer={setStartingPlayer}
              exportToJSON={exportToJSON}
              resetShots={() => setShots({ 0: 0, 1: 0 })}
              onEndRound={handleEndRound}
            />
            <button onClick={handleGameOver}>End Game</button>
            <pre>{JSON.stringify({ metadata, rounds }, null, 2)}</pre>
          </>
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;