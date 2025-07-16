import React, { useState, useEffect, useRef } from "react";
import ShooterSelection from "./ShooterSelection";
import ScoreInput from "./ScoreInput";
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, ToggleButtonGroup, ToggleButton, Grid, Box, Chip } from "@mui/material";
import { Backspace, Undo } from "@mui/icons-material";

const BoardState = ({
  onSaveShot,
  players,
  roundNumber,
  exportToJSON,
  resetShots,
  shots,
  startingPlayer,
  setStartingPlayer,
  onEndRound,
  rounds,
  undoLastShot,
  metadata,
}) => {
  const canvasRef = useRef(null);
  const [boardState, setBoardState] = useState([]);
  const [previousBoardState, setPreviousBoardState] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(startingPlayer);
  const [activeShooterIndex, setActiveShooterIndex] = useState(startingPlayer);
  const [shotType, setShotType] = useState("");
  const [firstShooterSet, setFirstShooterSet] = useState(false);
  const [scores, setScores] = useState({
    1: { name: players[1]?.name || "", twenties: 0, points: 0 },
    2: { name: players[2]?.name || "", twenties: 0, points: 0 },
  });
  const [roundEnded, setRoundEnded] = useState(false);
  const [shotCount, setShotCount] = useState(1);
  const [discCounts, setDiscCounts] = useState({ 1: 0, 2: 0 });
  const [twentyCounts, setTwentyCounts] = useState({ 1: 0, 2: 0 });
  const rgbCanvasRef = useRef(null);
  const rgbDataRef = useRef(null);
  const [rgbReady, setRgbReady] = useState(false);
  const [player1Points, setPlayer1Points] = useState(0);
  const [player2Points, setPlayer2Points] = useState(0);

  const zoneDefinitions = {
    "255,82,0": { points: 0, description: "Gutter" },
    "0,136,255": { points: 5, description: "Outer Ring" },
    "17,231,127": { points: 10, description: "Middle Ring" },
    "254,255,0": { points: 15, description: "Inner Ring" },
    "0,255,251": { points: 20, description: "Open 20" },
    "50,199,157": { points: 20, description: "Rebound 20" },
    "0,114,255": { points: 20, description: "Touch 20" },
    "94,149,218": { points: 20, description: "Follow Thru 20" },
    "228,28,229": { points: 20, description: "Bounce Back 20" },
    "160,156,94": { points: 20, description: "Angle In 20" },
    "162,162,153": { points: 20, description: "Magic 20" },
    "246,173,0": { points: 20, description: "Invalid Shot" },
    "101,102,184": { points: 20, description: "Opponent 20" },
    "217,171,196": { points: 20, description: "Other Shot" },
    "0,191,255": { points: 20, description: "Take Out 20" },
  };

  // Calculate running point totals
  useEffect(() => {
    const calculateTotals = () => {
      const totals = rounds.reduce(
        (acc, round) => ({
          player1: acc.player1 + (round.scores[1]?.points || 0),
          player2: acc.player2 + (round.scores[2]?.points || 0),
        }),
        { player1: 0, player2: 0 }
      );
      setPlayer1Points(totals.player1);
      setPlayer2Points(totals.player2);
    };
    calculateTotals();
  }, [rounds]);

  // Recalculate discCounts and twentyCounts from current round's shots
  useEffect(() => {
    const calculateCountsFromShots = () => {
      const currentRoundIndex = rounds.findIndex(
        (round) => round.roundNumber === roundNumber
      );
      if (currentRoundIndex < 0) return;

      const allDiscs = rounds[currentRoundIndex].shots.reduce((acc, shot) => [...acc, ...shot.boardState], []);
      setDiscCounts({
        1: allDiscs.filter(d => d.owner.name === players[1]?.name).length,
        2: allDiscs.filter(d => d.owner.name === players[2]?.name).length,
      });
      setTwentyCounts({
        1: allDiscs.filter(d => d.owner.name === players[1]?.name && d.zone.includes("20")).length,
        2: allDiscs.filter(d => d.owner.name === players[2]?.name && d.zone.includes("20")).length,
      });
    };
    calculateCountsFromShots();
  }, [rounds, roundNumber, players]);

  useEffect(() => {
    if (rgbDataRef.current) {
      return;
    }

    const loadRGBData = async () => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        const imageLoaded = new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        img.src = "/crokinole_board_colored.png";
        await imageLoaded;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 600;
        tempCanvas.height = 500;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, 0, 0, 600, 500);

        rgbDataRef.current = tempCtx.getImageData(0, 0, 600, 500);
        setRgbReady(true);
        console.log("RGB data loaded successfully");
      } catch (error) {
        console.error("Failed to load RGB data:", error);
        setRgbReady(false);
      }
    };

    loadRGBData();
  }, []);

  useEffect(() => {
    if (canvasRef.current && firstShooterSet) {
      drawBoard();
    }
  }, [boardState, previousBoardState, firstShooterSet]);

  useEffect(() => {
    if (shots[0] === 8 && shots[1] === 8) {
      setRoundEnded(true);
    }
  }, [shots]);

  useEffect(() => {
    if (startingPlayer !== null) {
      setCurrentPlayerIndex(startingPlayer);
      setActiveShooterIndex(startingPlayer);
      setTwentyCounts({ 1: 0, 2: 0 });
    }
  }, [roundNumber, startingPlayer]);

  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        const boardImage = new Image();
        boardImage.src = "/crokinole_board.png";
        boardImage.onload = () => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(boardImage, 0, 0, canvas.width, canvas.height);
          context.globalAlpha = 0.3;
          previousBoardState.forEach((disc) => {
            context.beginPath();
            context.arc(disc.x, disc.y, 10, 0, 2 * Math.PI);
            context.fillStyle = disc.owner.color;
            context.fill();
          });
          context.globalAlpha = 1.0;
          drawDiscs(context);
        };
      }
    }
  };

  const drawDiscs = (context) => {
    boardState.forEach((disc) => {
      if (disc.owner) {
        context.beginPath();
        context.arc(disc.x, disc.y, 10, 0, 2 * Math.PI);
        context.fillStyle = disc.owner.color;
        context.fill();
      }
    });
  };

  const getZoneInfo = (x, y) => {
    if (!rgbReady || !rgbDataRef.current) {
      console.warn("RGB data not ready");
      return { zone: "Unknown", points: 0 };
    }

    try {
      const scaleX = 600 / canvasRef.current.width;
      const scaleY = 500 / canvasRef.current.height;
      const scaledX = Math.min(Math.max(Math.round(x * scaleX), 0), 599);
      const scaledY = Math.min(Math.max(Math.round(y * scaleY), 0), 499);

      const imageData = rgbDataRef.current;
      const index = (scaledY * 600 + scaledX) * 4;
      const pixel = [
        imageData.data[index],
        imageData.data[index + 1],
        imageData.data[index + 2]
      ];

      const rgbColor = `${pixel[0]},${pixel[1]},${pixel[2]}`;
      console.log("Zone detection - Click:", x, y, "RGB:", rgbColor);

      let zoneInfo = zoneDefinitions[rgbColor] || { points: 0, description: "Unknown" };
      if (zoneInfo.description === "Unknown") {
        for (let defRgb in zoneDefinitions) {
          const [defR, defG, defB] = defRgb.split(",").map(Number);
          if (
            Math.abs(pixel[0] - defR) <= 5 &&
            Math.abs(pixel[1] - defG) <= 5 &&
            Math.abs(pixel[2] - defB) <= 5
          ) {
            zoneInfo = zoneDefinitions[defRgb];
            console.log("Matched zone with tolerance:", defRgb, "->", zoneInfo.description);
            break;
          }
        }
      }
      return { zone: zoneInfo.description, points: zoneInfo.points };
    } catch (e) {
      console.error("Zone detection error:", e);
      return { zone: "Unknown", points: 0 };
    }
  };

  const handleCanvasClick = (e) => {
    if (activeShooterIndex !== null) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Check for double-click (same x, y coordinates)
        const isDoubleClick = boardState.some(disc => 
          Math.abs(disc.x - x) < 1 && Math.abs(disc.y - y) < 1
        );
        if (isDoubleClick) {
          alert("Double-click detected! Please click a different position.");
          return;
        }
        const discId = boardState.length + 1;
        const zoneInfo = getZoneInfo(x, y);
        const newDisc = {
          discId,
          x,
          y,
          owner: players[activeShooterIndex + 1],
          zone: zoneInfo.zone,
          points: zoneInfo.points,
        };
        setBoardState([...boardState, newDisc]);
        setDiscCounts((prevCounts) => ({
          ...prevCounts,
          [activeShooterIndex + 1]: prevCounts[activeShooterIndex + 1] + 1,
        }));
        if (zoneInfo.zone.includes("20")) {
          setTwentyCounts((prev) => ({
            ...prev,
            [activeShooterIndex + 1]: prev[activeShooterIndex + 1] + 1,
          }));
        }
      }
    } else {
      alert("Please select the active shooter first.");
    }
  };

  const handleSaveShot = () => {
    const totalShots = shots[0] + shots[1];
    if (totalShots >= 16) {
      alert("Both players have taken all their shots.");
      return;
    }

    const shotData = {
      player: players[currentPlayerIndex + 1].name,
      playerIndex: currentPlayerIndex,
      boardState,
      shotType,
      shotNumber: shots[currentPlayerIndex] + 1,
      roundNumber,
      shotCount,
    };
    onSaveShot(shotData);
    setPreviousBoardState([...boardState]);
    setBoardState([]);
    setShotType("");
    setCurrentPlayerIndex(currentPlayerIndex === 0 ? 1 : 0);
    setActiveShooterIndex(currentPlayerIndex === 0 ? 1 : 0);
    setShotCount(shotCount + 1);
    setDiscCounts({ 1: 0, 2: 0 });
  };

  const handleSetFirstShooter = (index) => {
    setCurrentPlayerIndex(index);
    setActiveShooterIndex(index);
    setStartingPlayer(index);
    setFirstShooterSet(true);
  };

  const handleSetActiveShooter = (index) => {
    setActiveShooterIndex(index);
  };

  const handleUndoLastDisc = () => {
    if (boardState.length === 0) {
      return; // No discs to undo
    }
    const lastDisc = boardState[boardState.length - 1];
    setBoardState(boardState.slice(0, -1));
    setDiscCounts((prevCounts) => ({
      ...prevCounts,
      [activeShooterIndex + 1]: prevCounts[activeShooterIndex + 1] - 1,
    }));
    if (lastDisc?.zone?.includes("20")) {
      setTwentyCounts((prev) => ({
        ...prev,
        [activeShooterIndex + 1]: prev[activeShooterIndex + 1] - 1,
      }));
    }
  };

  const handleUndoLastSavedShot = () => {
    const currentRoundIndex = rounds.findIndex(
      (round) => round.roundNumber === roundNumber
    );
    if (currentRoundIndex < 0 || rounds[currentRoundIndex].shots.length === 0) {
      return; // No saved shots to undo
    }

    const undoneShot = undoLastShot();
    if (undoneShot) {
      setBoardState(undoneShot.boardState);
      setPreviousBoardState(undoneShot.boardState);
      setShotType(undoneShot.shotType);
      setCurrentPlayerIndex(undoneShot.playerIndex);
      setActiveShooterIndex(undoneShot.playerIndex);
      setShotCount(undoneShot.shotCount);
      // Counts updated by useEffect
    }
  };

  const handleScoreChange = (e) => {
    const { name, value } = e.target;
    const [player, scoreType] = name.split("_");
    setScores((prevScores) => ({
      ...prevScores,
      [player]: {
        ...prevScores[player],
        [scoreType]: value === "" ? 0 : isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10),
      },
    }));
  };

  const handleEndRoundSubmit = () => {
    onEndRound(scores);
    setRoundEnded(false);
    setShotCount(1);
    setScores({
      1: { name: players[1]?.name || "", twenties: 0, points: 0 },
      2: { name: players[2]?.name || "", twenties: 0, points: 0 },
    });
    setTwentyCounts({ 1: 0, 2: 0 });
    setPreviousBoardState([]);
    setBoardState([]);
  };

  const calculateTotalTwenties = () => {
    return (scores[1].twenties || 0) + (scores[2].twenties || 0);
  };

  const calculateTotalPoints = () => {
    return (scores[1].points || 0) + (scores[2].points || 0);
  };

  const CustomShooterSelection = ({ activeShooterIndex, players, handleSetActiveShooter }) => {
    const [selectedIndex, setSelectedIndex] = useState(activeShooterIndex);

    const handleShooterChange = (event, newIndex) => {
      if (newIndex !== null) {
        setSelectedIndex(newIndex);
        handleSetActiveShooter(newIndex);
      }
    };

    return (
      <ToggleButtonGroup
        value={selectedIndex}
        exclusive
        onChange={handleShooterChange}
        aria-label="select active shooter"
        sx={{ maxWidth: '400px', minWidth: '300px', width: '100%' }}
      >
        <ToggleButton value={0} aria-label="Player 1" sx={{ display: 'flex', alignItems: 'center', color: players[1]?.color || "#000", whiteSpace: 'nowrap' }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: players[1]?.color || '#000',
              marginRight: '8px'
            }}
          />
          {players[1]?.name || "Player 1"}
        </ToggleButton>
        <ToggleButton value={1} aria-label="Player 2" sx={{ display: 'flex', alignItems: 'center', color: players[2]?.color || "#f00", whiteSpace: 'nowrap' }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: players[2]?.color || '#f00',
              marginRight: '8px'
            }}
          />
          {players[2]?.name || "Player 2"}
        </ToggleButton>
      </ToggleButtonGroup>
    );
  };

  // Check if undo last saved shot is possible
  const canUndoSavedShot = () => {
    const currentRoundIndex = rounds.findIndex(
      (round) => round.roundNumber === roundNumber
    );
    return currentRoundIndex >= 0 && rounds[currentRoundIndex].shots.length > 0;
  };

  // Derive tournamentName from metadata
  const tournamentName = metadata?.matchId && metadata?.date
    ? `${metadata.matchId} ${new Date(metadata.date).getFullYear()}`
    : "Unknown Tournament";

  return (
    <Paper elevation={3} style={{ padding: "20px", margin: "10px auto", maxWidth: "600px", backgroundColor: '#ffffff', borderRadius: 8 }}>
      <Grid container spacing={1} sx={{ marginBottom: "10px" }}>
        <Grid item xs={4}>
          <Typography variant="body1" sx={{ color: '#333' }}>
            {tournamentName}
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ display: "flex", justifyContent: "center" }}>
          <Paper elevation={1} sx={{ backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: 2 }}>
            <Typography variant="body1" sx={{ color: '#333' }}>
              Round {roundNumber}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4} sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Typography variant="body1" sx={{ color: '#333' }}>
            {metadata?.tournamentRound || "Unknown Round"}
          </Typography>
        </Grid>
      </Grid>
      {!firstShooterSet && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: "8px", margin: "10px 0" }}>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={() => handleSetFirstShooter(0)}
          >
            {players[1]?.name || "Player 1"} Shoots First
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={() => handleSetFirstShooter(1)}
          >
            {players[2]?.name || "Player 2"} Shoots First
          </Button>
        </Box>
      )}
      {firstShooterSet && (
        <>
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 4, padding: '4px', margin: '10px 0', backgroundColor: '#fafafa' }}>
            <Typography variant="body2" align="center" sx={{ color: '#333' }}>
              {roundEnded ? "End of Round" : `${players[currentPlayerIndex + 1]?.name || "Player"} | ${players[currentPlayerIndex + 1]?.side} side | Shot ${shots[currentPlayerIndex] + 1}`}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", gap: "8px", margin: "10px 0" }}>
            <Chip
              label={`20s: ${twentyCounts[1]}`}
              sx={{ backgroundColor: players[1]?.color || '#000', color: '#fff' }}
            />
            <Chip
              label={`20s: ${twentyCounts[2]}`}
              sx={{ backgroundColor: players[2]?.color || '#f00', color: '#fff' }}
            />
          </Box>
          <Grid container spacing={1} sx={{ margin: "10px 0" }}>
            <Grid item xs={12} sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                sx={{ color: '#1976d2' }}
                onClick={handleUndoLastDisc}
                disabled={boardState.length === 0}
                startIcon={<Backspace />}
              >
                Undo Disc
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="secondary"
                onClick={handleUndoLastSavedShot}
                disabled={!canUndoSavedShot()}
                startIcon={<Undo />}
              >
                Undo Shot
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={1} sx={{ margin: "10px 0", alignItems: "center" }}>
            <Grid item xs={4} /> {/* Spacer */}
            <Grid item xs={4} sx={{ display: "flex", justifyContent: "center" }}>
              <CustomShooterSelection
                activeShooterIndex={activeShooterIndex}
                players={players}
                handleSetActiveShooter={handleSetActiveShooter}
              />
            </Grid>
            <Grid item xs={4} sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={handleSaveShot}
                disabled={boardState.length === 0}
              >
                Save Shot
              </Button>
            </Grid>
          </Grid>
          <canvas
            ref={canvasRef}
            width={600}
            height={500}
            onClick={handleCanvasClick}
            style={{ border: "1px solid #ccc", display: "block", margin: "10px auto", backgroundColor: "#ffffff" }}
          />
          <TableContainer component={Paper} style={{ margin: "10px 0", boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell style={{ backgroundColor: '#f5f5f5' }}></TableCell>
                  <TableCell align="center" style={{ backgroundColor: '#f5f5f5', fontWeight: "bold", color: '#333' }}>
                    {players[1]?.name || "Player 1"}
                  </TableCell>
                  <TableCell align="center" style={{ backgroundColor: '#f5f5f5', fontWeight: "bold", color: '#333' }}>
                    {players[2]?.name || "Player 2"}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell style={{ backgroundColor: '#fafafa' }}>20s</TableCell>
                  <TableCell align="center" style={{ backgroundColor: '#fafafa', color: players[1].color }}>
                    {twentyCounts[1]}
                  </TableCell>
                  <TableCell align="center" style={{ backgroundColor: '#fafafa', color: players[2].color }}>
                    {twentyCounts[2]}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ backgroundColor: '#fafafa' }}>Shots</TableCell>
                  <TableCell align="center" style={{ backgroundColor: '#fafafa', color: players[1].color }}>
                    {shots[0]}
                  </TableCell>
                  <TableCell align="center" style={{ backgroundColor: '#fafafa', color: players[2].color }}>
                    {shots[1]}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ backgroundColor: '#fafafa' }}>Match Score</TableCell>
                  <TableCell align="center" style={{ backgroundColor: '#fafafa', color: players[1].color }}>
                    {player1Points}
                  </TableCell>
                  <TableCell align="center" style={{ backgroundColor: '#fafafa', color: players[2].color }}>
                    {player2Points}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          {roundEnded && (
            <Paper elevation={3} style={{ padding: "20px", margin: "10px 0", backgroundColor: '#ffffff', borderRadius: 8 }}>
              <Typography variant="h3" align="center" gutterBottom>End of Round {roundNumber}</Typography>
              <ScoreInput
                players={players}
                scores={scores}
                handleScoreChange={handleScoreChange}
                handleEndRoundSubmit={handleEndRoundSubmit}
                calculateTotalTwenties={calculateTotalTwenties}
                calculateTotalPoints={calculateTotalPoints}
                roundNumber={roundNumber}
                twentyCounts={twentyCounts}
              />
            </Paper>
          )}
        </>
      )}
    </Paper>
  );
};

export default BoardState;