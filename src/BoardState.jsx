import React, { useState, useEffect, useRef } from "react";
import ShooterSelection from "./ShooterSelection";
import ScoreInput from "./ScoreInput";
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Custom theme for a professional white design
const theme = createTheme({
  palette: {
    primary: { main: '#4CAF50' }, // Green for actions
    secondary: { main: '#FF0000' }, // Red for player accents
    background: { default: '#ffffff', paper: '#ffffff' }, // Pure white background
    text: { primary: '#333' }, // Dark text for readability
    divider: '#e0e0e0', // Light divider for sections
  },
  typography: {
    fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h2: { fontSize: '1.2rem', fontWeight: 500 },
    h3: { fontSize: '0.9rem', fontWeight: 400 },
    subtitle1: { fontSize: '0.8rem' }, // Slightly larger for better readability
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded corners for a modern look
        },
      },
    },
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
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Force reload on mount or restart
  const [canvasMounted, setCanvasMounted] = useState(false); // Track canvas mount

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

  // Set canvasMounted when refs are available and ensure proper timing
  useEffect(() => {
    const checkCanvasMount = () => {
      if (canvasRef.current && rgbCanvasRef.current) {
        setCanvasMounted(true);
        console.log("Canvases mounted:", canvasRef.current, rgbCanvasRef.current);
        return true;
      }
      return false;
    };

    // Check immediately
    if (!checkCanvasMount()) {
      // If not ready, check again after a short delay
      const timer = setTimeout(checkCanvasMount, 100);
      return () => clearTimeout(timer);
    }
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
      setTwentyCounts({ 1: 0, 2: 0 }); // Reset 20s count per round
    }
  }, [roundNumber, startingPlayer]);

  // Load RGB image with improved timing and error handling
  useEffect(() => {
    if (!canvasMounted || !rgbCanvasRef.current) {
      console.log("Waiting for canvas mount or ref...");
      return;
    }

    const rgbCanvas = rgbCanvasRef.current;
    console.log("Attempting to load RGB image, trigger:", refreshTrigger);

    const loadImage = () => {
      return new Promise((resolve, reject) => {
        const loadedImage = new Image();
        loadedImage.crossOrigin = "anonymous";
        
        loadedImage.onload = () => {
          try {
            rgbCanvas.width = 600;
            rgbCanvas.height = 500;
            const context = rgbCanvas.getContext("2d");
            context.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
            context.drawImage(loadedImage, 0, 0, 600, 500);
            
            // Add a small delay to ensure the canvas is fully ready
            setTimeout(() => {
              try {
                // Validate the image data
                const samplePixel = context.getImageData(300, 250, 1, 1).data;
                console.log("Center RGB at 300,250:", `${samplePixel[0]},${samplePixel[1]},${samplePixel[2]}`);
                
                if (samplePixel[0] === 0 && samplePixel[1] === 0 && samplePixel[2] === 0) {
                  throw new Error("Invalid image data - all pixels black");
                }
                
                console.log("RGB image loaded and ready for pixel access");
                setIsRgbLoaded(true);
                resolve();
              } catch (error) {
                reject(error);
              }
            }, 100); // 100ms delay to ensure canvas is ready
          } catch (error) {
            reject(error);
          }
        };
        
        loadedImage.onerror = () => {
          reject(new Error("Image failed to load"));
        };
        
        // Start loading
        loadedImage.src = "/crokinole_board_colored.png";
      });
    };

    loadImage().catch((error) => {
      console.error("Image load error (trigger", refreshTrigger, "):", error.message);
      if (refreshTrigger < 5) { // Increase retry attempts
        setTimeout(() => {
          setRefreshTrigger(refreshTrigger + 1);
          console.log("Retrying image load, trigger:", refreshTrigger + 1);
        }, 500); // Add delay before retry
      } else {
        console.error("Max retries reached - image load failed permanently");
      }
    });
  }, [canvasMounted, refreshTrigger]); // Simplified dependency array

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
    if (!rgbCanvas || !isRgbLoaded) {
      console.warn("RGB canvas not loaded or ready - check image load");
      return { zone: "Unknown", points: 0 };
    }

    const context = rgbCanvas.getContext("2d");
    if (!context) {
      console.warn("Could not get RGB canvas context");
      return { zone: "Unknown", points: 0 };
    }

    // Verify canvas has valid dimensions and data
    if (rgbCanvas.width === 0 || rgbCanvas.height === 0) {
      console.warn("RGB canvas has invalid dimensions");
      return { zone: "Unknown", points: 0 };
    }

    try {
      // Test if we can read pixel data by checking a center pixel first
      const testPixel = context.getImageData(300, 250, 1, 1).data;
      if (testPixel[0] === 0 && testPixel[1] === 0 && testPixel[2] === 0) {
        console.warn("RGB canvas appears to have no valid image data");
        return { zone: "Unknown", points: 0 };
      }

      const scaleX = rgbCanvas.width / canvasRef.current.width;
      const scaleY = rgbCanvas.height / canvasRef.current.height;
      const scaledX = Math.min(Math.max(Math.round(x * scaleX), 0), rgbCanvas.width - 1);
      const scaledY = Math.min(Math.max(Math.round(y * scaleY), 0), rgbCanvas.height - 1);
      console.log("Clicked:", x, y, "Scaled:", scaledX, scaledY);
      
      const pixel = context.getImageData(scaledX, scaledY, 1, 1).data;
      const rgbColor = `${pixel[0]},${pixel[1]},${pixel[2]}`;
      console.log("RGB at", scaledX, scaledY, ":", rgbColor);
      
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
      console.error("ImageData error:", e);
      console.warn("RGB canvas not ready for pixel data access");
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

  // Custom ShooterSelection component with MUI
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
        style={{ margin: "10px 0", display: "flex", justifyContent: "center" }}
      >
        <ToggleButton value={0} aria-label="Player 1" style={{ color: players[1]?.color || "#000" }}>
          {players[1]?.name || "Player 1"}
        </ToggleButton>
        <ToggleButton value={1} aria-label="Player 2" style={{ color: players[2]?.color || "#f00" }}>
          {players[2]?.name || "Player 2"}
        </ToggleButton>
      </ToggleButtonGroup>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Paper elevation={3} style={{ padding: "20px", margin: "10px auto", maxWidth: "600px", backgroundColor: '#ffffff', borderRadius: 8 }}>
        <Typography variant="h2" align="center" gutterBottom>Round {roundNumber}</Typography>
        {!firstShooterSet && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "10px 0" }}>
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
          </div>
        )}
        {firstShooterSet && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0" }}>
              <Button
                variant="outlined"
                size="small"
                color="primary"
                onClick={handleUndoLastShot}
              >
                Undo Last Shot
              </Button>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={handleSaveShot}
              >
                Save Shot
              </Button>
            </div>
            <Typography variant="h3" align="center" style={{ color: players[currentPlayerIndex + 1]?.color || "#333", margin: "5px 0" }}>
              {players[currentPlayerIndex + 1]?.name || "Player"} ||{" "}
              {players[currentPlayerIndex + 1]?.side} side || Shot{" "}
              {shots[currentPlayerIndex] + 1}
            </Typography>
            <Typography variant="subtitle1" align="center" style={{ margin: "5px 0" }}>
              <span style={{ color: players[1].color }}>●</span> {discCounts[1]}
              <span style={{ color: players[2].color, marginLeft: "5px" }}>●</span>{" "}
              {discCounts[2]}
            </Typography>
            <CustomShooterSelection
              activeShooterIndex={activeShooterIndex}
              players={players}
              handleSetActiveShooter={handleSetActiveShooter}
            />
            <canvas
              ref={canvasRef}
              width={600}
              height={500}
              onClick={handleCanvasClick}
              style={{ border: "1px solid #ccc", display: "block", margin: "10px auto", backgroundColor: "#ffffff" }}
            />
            {/* Hidden canvas for RGB classification */}
            <canvas ref={rgbCanvasRef} style={{ display: "none" }} />
            {/* Enhanced stats table */}
            <TableContainer component={Paper} style={{ margin: "10px 0", boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ backgroundColor: '#f5f5f5' }}></TableCell>
                    <TableCell align="center" style={{ backgroundColor: '#f5f5f5', fontWeight: "bold", color: theme.palette.text.primary }}>
                      {players[1]?.name || "Player 1"}
                    </TableCell>
                    <TableCell align="center" style={{ backgroundColor: '#f5f5f5', fontWeight: "bold", color: theme.palette.text.primary }}>
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
                />
              </Paper>
            )}
          </>
        )}
      </Paper>
    </ThemeProvider>
  );
};

export default BoardState;