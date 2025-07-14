import React, { useState } from "react";
import MetadataForm from "./MetadataForm";
import BoardState from "./BoardState";
import theme from './theme';
import { ThemeProvider, Typography } from '@mui/material';

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

    // Generate filename
    const player1Name = metadata?.players?.[1]?.name?.split(' ')?.[0] || 'Player1';
    const player2Name = metadata?.players?.[2]?.name?.split(' ')?.[0] || 'Player2';
    const year = metadata?.date ? new Date(metadata.date).getFullYear() : 'UnknownYear';
    const matchId = metadata?.matchId?.replace(/\s+/g, '') || 'UnknownMatch';
    const tournamentRound = metadata?.tournamentRound?.replace(/\s+/g, '') || 'UnknownRound';
    const filename = `classified_${player1Name}${player2Name}_${year}${matchId}_${tournamentRound}.json`;

    const blob = new Blob(
      [JSON.stringify({ metadata, rounds: filteredRounds }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    return filename; // For display purposes
  };

  // Generate filename for display (same logic as in exportToJSON)
  const getFilename = () => {
    if (!metadata) return "No metadata available";
    const player1Name = metadata?.players?.[1]?.name?.split(' ')?.[0] || 'Player1';
    const player2Name = metadata?.players?.[2]?.name?.split(' ')?.[0] || 'Player2';
    const year = metadata?.date ? new Date(metadata.date).getFullYear() : 'UnknownYear';
    const matchId = metadata?.matchId?.replace(/\s+/g, '') || 'UnknownMatch';
    const tournamentRound = metadata?.tournamentRound?.replace(/\s+/g, '') || 'UnknownRound';
    return `classified_${player1Name}${player2Name}_${year}${matchId}_${tournamentRound}.json`;
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
            <Typography variant="subtitle1" align="center" style={{ margin: "10px 0", color: '#333' }}>
              Export Filename: {getFilename()}
            </Typography>
            <button onClick={handleGameOver}>End Game</button>
            <pre>{JSON.stringify({ metadata, rounds }, null, 2)}</pre>
          </>
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;