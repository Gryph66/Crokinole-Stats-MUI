import React from "react";
import { TextField, Button, Grid, Typography, Box } from "@mui/material";

const ScoreInput = ({
  players,
  scores,
  handleScoreChange,
  handleEndRoundSubmit,
  calculateTotalTwenties,
  calculateTotalPoints,
  roundNumber,
  twentyCounts,
}) => {
  const validateAndSubmit = (e) => {
    e.preventDefault();

    // Ensure scores are valid numbers, treating empty or invalid as 0
    const score1Points = scores[1].points === "" || isNaN(scores[1].points) ? 0 : parseInt(scores[1].points, 10);
    const score2Points = scores[2].points === "" || isNaN(scores[2].points) ? 0 : parseInt(scores[2].points, 10);
    const score1Twenties = scores[1].twenties === "" || isNaN(scores[1].twenties) ? 0 : parseInt(scores[1].twenties, 10);
    const score2Twenties = scores[2].twenties === "" || isNaN(scores[2].twenties) ? 0 : parseInt(scores[2].twenties, 10);

    // Validate score sum
    const totalPoints = score1Points + score2Points;
    if (totalPoints !== 2) {
      alert("Scores must sum to 2. Please correct.");
      return;
    }

    // Validate 20s counts
    const twentiesMismatch = score1Twenties !== twentyCounts[1] || score2Twenties !== twentyCounts[2];
    if (twentiesMismatch) {
      const isConfirmed = window.confirm(
        "Entered 20s don't match calculated values. Save anyway?"
      );
      if (!isConfirmed) {
        return;
      }
    }

    // Update scores state with validated values before submission
    handleScoreChange({ target: { name: "1_points", value: score1Points } });
    handleScoreChange({ target: { name: "2_points", value: score2Points } });
    handleScoreChange({ target: { name: "1_twenties", value: score1Twenties } });
    handleScoreChange({ target: { name: "2_twenties", value: score2Twenties } });

    handleEndRoundSubmit();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Allow empty input, convert invalid numbers to 0
    const parsedValue = value === "" ? "" : isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10);
    handleScoreChange({ target: { name, value: parsedValue } });
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <form onSubmit={validateAndSubmit} style={{ maxWidth: "400px", width: "100%" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography align="right" sx={{ color: players[1]?.color || "#000" }}>
                  {players[1]?.name || "Player 1"}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="20s"
                  name="1_twenties"
                  type="number"
                  value={scores[1].twenties}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Points"
                  name="1_points"
                  type="text"
                  inputProps={{ pattern: '[0-2]' }}
                  value={scores[1].points}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography align="right" sx={{ color: players[2]?.color || "#f00" }}>
                  {players[2]?.name || "Player 2"}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="20s"
                  name="2_twenties"
                  type="number"
                  value={scores[2].twenties}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Points"
                  name="2_points"
                  type="text"
                  inputProps={{ pattern: '[0-2]' }}
                  value={scores[2].points}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <Typography variant="body2" sx={{ marginRight: 2 }}>
              Total Points: {calculateTotalPoints()} | Total 20s: {calculateTotalTwenties()}
            </Typography>
            <Button type="submit" variant="contained" color="primary" size="small">
              Submit Round {roundNumber}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ScoreInput;