import React, { useState, useEffect, Component } from "react";
import MetadataForm from "./MetadataForm";
import BoardState from "./BoardState";
import theme from './theme';
import { ThemeProvider, Typography, Box, Chip } from '@mui/material';

// Simple error boundary
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ padding: '20px', textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Something went wrong. Please refresh the page or check the console for details.
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

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
  const [apiStatus, setApiStatus] = useState({ 
    isOnline: false, 
    checking: true, 
    lastChecked: null 
  });

  // Check API health status
  const checkApiHealth = async () => {
    setApiStatus(prev => ({ ...prev, checking: true }));
    try {
      const response = await fetch("https://crokinole-shot-analytics-gryph66.replit.app/health", {
        method: 'GET',
        timeout: 5000
      });
      
      setApiStatus({
        isOnline: response.ok,
        checking: false,
        lastChecked: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setApiStatus({
        isOnline: false,
        checking: false,
        lastChecked: new Date().toLocaleTimeString()
      });
    }
  };

  // Check API status on component mount and every 30 seconds
  useEffect(() => {
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const undoLastShot = () => {
    let undoneShot = null;
    setRounds((prevRounds) => {
      const updatedRounds = [...prevRounds];
      const currentRoundIndex = updatedRounds.findIndex(
        (round) => round.roundNumber === currentRound,
      );
      if (currentRoundIndex >= 0 && updatedRounds[currentRoundIndex].shots.length > 0) {
        undoneShot = updatedRounds[currentRoundIndex].shots.pop();
      }
      return updatedRounds;
    });

    if (undoneShot) {
      setShots((prevShots) => {
        const updatedShots = { ...prevShots };
        updatedShots[undoneShot.playerIndex] -= 1;
        return updatedShots;
      });
    }

    return undoneShot;
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

  const sendDataToProcessingApp = async (data) => {
    const api_url = "https://crokinole-shot-analytics-gryph66.replit.app/upload-classified";
    
    // Generate the proper filename
    const player1Name = metadata?.players?.[1]?.name?.split(' ')?.[0] || 'Player1';
    const player2Name = metadata?.players?.[2]?.name?.split(' ')?.[0] || 'Player2';
    const year = metadata?.date ? new Date(metadata.date).getFullYear() : 'UnknownYear';
    const matchId = metadata?.matchId?.replace(/\s+/g, '') || 'UnknownMatch';
    const tournamentRound = metadata?.tournamentRound?.replace(/\s+/g, '') || 'UnknownRound';
    const filename = `classified_${player1Name}${player2Name}_${year}${matchId}_${tournamentRound}.json`;
    
    try {
      const response = await fetch(api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          filename: filename
        }),
        timeout: 30000
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`✓ Successfully sent: ${result.filename || filename}`);
        return true;
      } else {
        const errorText = await response.text();
        alert(`✗ Error: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      alert(`✗ Failed to send: ${error.message}`);
      return false;
    }
  };

  const handleGameOverDownload = () => {
    setGameOver(true);
    exportToJSON();
  };

  const handleGameOverUpload = async () => {
    setGameOver(true);
    const filteredRounds = rounds.filter((round, index) => {
      return index === rounds.length - 1 ? round.shots.length > 0 : true;
    });
    
    const gameData = { metadata, rounds: filteredRounds };
    await sendDataToProcessingApp(gameData);
  };

  const exportToJSON = () => {
    const filteredRounds = rounds.filter((round, index) => {
      return index === rounds.length - 1 ? round.shots.length > 0 : true;
    });

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

    return filename;
  };

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
      <ErrorBoundary>
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
                rounds={rounds}
                undoLastShot={undoLastShot}
                metadata={metadata} // Added metadata prop
              />
              <Typography variant="subtitle1" align="center" style={{ margin: "10px 0", color: '#333' }}>
                Export Filename: {getFilename()}
              </Typography>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '10px 0' }}>
                <button onClick={handleGameOverDownload}>End Game - Download</button>
                <button onClick={handleGameOverUpload}>End Game - Send To App</button>
              </div>
              <pre>{JSON.stringify({ metadata, rounds }, null, 2)}</pre>
            </>
          )}
          
          {/* API Status Display */}
          <Box sx={{ 
            position: 'fixed', 
            bottom: 10, 
            right: 10, 
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Chip
              label={apiStatus.checking ? "Checking API..." : apiStatus.isOnline ? "API Online" : "API Offline"}
              color={apiStatus.checking ? "default" : apiStatus.isOnline ? "success" : "error"}
              size="small"
              variant="filled"
            />
            {apiStatus.lastChecked && (
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.6rem' }}>
                {apiStatus.lastChecked}
              </Typography>
            )}
          </Box>
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;