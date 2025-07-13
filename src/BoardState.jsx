import React, { useState, useEffect, useRef } from "react";
import ShooterSelection from "./ShooterSelection";
import ScoreInput from "./ScoreInput";
import { Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Custom theme for modern, smaller fonts
const theme = createTheme({
  typography: {
    fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h2: { fontSize: '1.2rem', fontWeight: 500 },
    h3: { fontSize: '0.9rem', fontWeight: 400 },
    subtitle1: { fontSize: '0.7rem' },
  },
});

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
}) => {
  const canvasRef = useRef(null);
  const [boardState, setBoardState] = useState([]); // Current shot's discs
  const [previousBoardState, setPreviousBoardState] = useState([]); // Faint discs from last shot
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
  const [twentyCounts, setTwentyCounts] = useState({ 1: 0, 2: 0 }); // Running total of 20s
  const rgbCanvasRef = useRef(null); // Hidden canvas for RGB classification
  const [isRgbLoaded, setIsRgbLoaded] = useState(false); // Track RGB canvas load state

  // Zone definitions from shotclassify.py, with RGB as string keys
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
      setTwentyCounts({ 1: 0, 2: 0 }); // Reset 20s count per round
    }
  }, [roundNumber, startingPlayer]);

  // Load RGB mask into hidden canvas once
  useEffect(() => {
    const rgbCanvas = rgbCanvasRef.current;
    if (rgbCanvas) {
      const rgbImage = new Image();
      rgbImage.crossOrigin = "anonymous"; // Handle potential CORS issues
      rgbImage.src = "/crokinole_board_colored.png";
      rgbImage.onload = () => {
        rgbCanvas.width = rgbImage.width; // Use natural 600x500
        rgbCanvas.height = rgbImage.height;
        const context = rgbCanvas.getContext("2d");
        context.drawImage(rgbImage, 0, 0); // Draw at natural size
        console.log("RGB canvas loaded:", rgbCanvas.width, "x", rgbCanvas.height); // Debug
        const samplePixel = context.getImageData(0, 0, 1, 1).data;
        console.log("Sample RGB at 0,0:", `${samplePixel[0]},${samplePixel[1]},${samplePixel[2]}`);
        setIsRgbLoaded(true); // Mark as loaded
      };
      rgbImage.onerror = () => console.error("Failed to load RGB mask image - check path /crokinole_board_colored.png in public/");
    }
  }, []);

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
          // Draw faint previous discs
          context.globalAlpha = 0.3;
          previousBoardState.forEach((disc) => {
            context.beginPath();
            context.arc(disc.x, disc.y, 10, 0, 2 * Math.PI);
            context.fillStyle = disc.owner.color;
            context.fill();
          });
          context.globalAlpha = 1.0;
          // Draw current discs
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
    const rgbCanvas = rgbCanvasRef.current;
    if (rgbCanvas && isRgbLoaded) { // Only proceed if loaded
      const context = rgbCanvas.getContext("2d");
      const scaledX = Math.min(Math.max(Math.round(x), 0), rgbCanvas.width - 1);
      const scaledY = Math.min(Math.max(Math.round(y), 0), rgbCanvas.height - 1);
      console.log("Clicked:", x, y, "Scaled:", scaledX, scaledY); // Debug coordinates
      try {
        const pixel = context.getImageData(scaledX, scaledY, 1, 1).data; // [r, g, b, a]
        const rgbColor = `${pixel[0]},${pixel[1]},${pixel[2]}`;
        console.log("RGB at", scaledX, scaledY, ":", rgbColor); // Debug RGB
        let zoneInfo = zoneDefinitions[rgbColor] || { points: 0, description: "Unknown" };
        if (zoneInfo.description === "Unknown") {
          // Tolerance check (±5 on each RGB channel)
          for (let defRgb in zoneDefinitions) {
            const [defR, defG, defB] = defRgb.split(",").map(Number);
            if (
              Math.abs(pixel[0] - defR) <= 5 &&
              Math.abs(pixel[1] - defG) <= 5 &&
              Math.abs(pixel[2] - defB) <= 5
            ) {
              zoneInfo = zoneDefinitions[defRgb];
              console.log("Near match found:", defRgb);
              break;
            }
          }
        }
        return { zone: zoneInfo.description, points: zoneInfo.points };
      } catch (e) {
        console.error("ImageData error:", e, "at", scaledX, scaledY);
        return { zone: "Unknown", points: 0 };
      }
    }
    console.warn("RGB canvas not loaded or ready");
    return { zone: "Unknown", points: 0 };
  };

  const handleCanvasClick = (e) => {
    if (activeShooterIndex !== null) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
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
        // Update 20s count if zone contains "20"
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

  const handleUndoLastShot = () => {
    setBoardState(boardState.slice(0, -1));
    setDiscCounts((prevCounts) => ({
      ...prevCounts,
      [activeShooterIndex + 1]: prevCounts[activeShooterIndex + 1] - 1,
    }));
    // Adjust 20s count if undoing a 20
    const lastDisc = boardState[boardState.length - 1];
    if (lastDisc?.zone?.includes("20")) {
      setTwentyCounts((prev) => ({
        ...prev,
        [activeShooterIndex + 1]: prev[activeShooterIndex + 1] - 1,
      }));
    }
  };

  const handleScoreChange = (e) => {
    const { name, value } = e.target;
    const [player, scoreType] = name.split("_");
    setScores((prevScores) => ({
      ...prevScores,
      [player]: {
        ...prevScores[player],
        [scoreType]: parseInt(value, 10) || 0,
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
    setTwentyCounts({ 1: 0, 2: 0 }); // Reset 20s count after round
  };

  const calculateTotalTwenties = () => {
    return scores[1].twenties + scores[2].twenties;
  };

  const calculateTotalPoints = () => {
    return scores[1].points + scores[2].points;
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ width: "600px", margin: "0 auto", padding: "10px" }}>
        <h2>Round {roundNumber}</h2>
        {!firstShooterSet && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "10px" }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleSetFirstShooter(0)}
            >
              {players[1]?.name || "Player 1"} Shoots First
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleSetFirstShooter(1)}
            >
              {players[2]?.name || "Player 2"} Shoots First
            </Button>
          </div>
        )}
        {firstShooterSet && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleUndoLastShot}
              >
                Undo Last Shot
              </Button>
              <Button
                variant="contained"
                size="small"
                color="success"
                onClick={handleSaveShot}
              >
                Save Shot
              </Button>
            </div>
            <h3
              style={{ color: players[currentPlayerIndex + 1]?.color || "black", textAlign: "center", marginBottom: "5px" }}
            >
              {players[currentPlayerIndex + 1]?.name || "Player"} ||{" "}
              {players[currentPlayerIndex + 1]?.side} side || Shot{" "}
              {shots[currentPlayerIndex] + 1}
            </h3>
            <p style={{ textAlign: "center", marginBottom: "5px", fontSize: "0.7rem" }}>
              <span style={{ color: players[1].color }}>●</span> {discCounts[1]}
              <span style={{ color: players[2].color, marginLeft: "5px" }}>
                ●
              </span>{" "}
              {discCounts[2]}
            </p>
            <ShooterSelection
              activeShooterIndex={activeShooterIndex}
              players={players}
              handleSetActiveShooter={handleSetActiveShooter}
            />
            <canvas
              ref={canvasRef}
              width={600}
              height={500}
              onClick={handleCanvasClick}
              style={{ border: "1px solid #ccc", display: "block", margin: "0 auto", backgroundColor: "#ffffff" }} // White background
            />
            {/* Hidden canvas for RGB classification */}
            <canvas ref={rgbCanvasRef} style={{ display: "none" }} />
            {/* Table display of stats */}
            <TableContainer component={Paper} style={{ marginTop: "10px", backgroundColor: "#fff" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="center" style={{ fontWeight: "bold", color: "#333" }}>
                      {players[1]?.name || "Player 1"}
                    </TableCell>
                    <TableCell align="center" style={{ fontWeight: "bold", color: "#333" }}>
                      {players[2]?.name || "Player 2"}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>20s</TableCell>
                    <TableCell align="center" style={{ color: players[1].color }}>
                      {twentyCounts[1]}
                    </TableCell>
                    <TableCell align="center" style={{ color: players[2].color }}>
                      {twentyCounts[2]}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Shots</TableCell>
                    <TableCell align="center" style={{ color: players[1].color }}>
                      {shots[0]}
                    </TableCell>
                    <TableCell align="center" style={{ color: players[2].color }}>
                      {shots[1]}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            {roundEnded && (
              <div>
                <h3>End of Round {roundNumber}</h3>
                <ScoreInput
                  players={players}
                  scores={scores}
                  handleScoreChange={handleScoreChange}
                  handleEndRoundSubmit={handleEndRoundSubmit}
                  calculateTotalTwenties={calculateTotalTwenties}
                  calculateTotalPoints={calculateTotalPoints}
                  roundNumber={roundNumber}
                />
              </div>
            )}
          </>
        )}
      </div>
    </ThemeProvider>
  );
};

export default BoardState;