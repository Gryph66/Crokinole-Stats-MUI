import React from 'react';
import { TextField, Button, Grid, Typography } from '@mui/material';

const ScoreInput = ({
  players,
  scores,
  handleScoreChange,
  handleEndRoundSubmit,
  calculateTotalTwenties,
  calculateTotalPoints,
}) => {
  // Handle input change to ensure string values and trim leading zeros
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert to number, remove leading zeros, and treat as string
    const cleanedValue = value === '' ? '' : String(parseInt(value, 10) || 0);
    handleScoreChange({ target: { name, value: cleanedValue } });
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: players[1]?.color || '#333', fontSize: '0.875rem', textAlign: 'right' }}>
              {players[1]?.name || 'Player 1'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="20s"
              name="1_twenties"
              type="number"
              value={scores[1]?.twenties !== undefined ? String(scores[1].twenties) : ''}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
              sx={{ marginY: '4px' }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Points"
              name="1_points"
              type="number"
              value={scores[1]?.points !== undefined ? String(scores[1].points) : ''}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
              sx={{ marginY: '4px' }}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: players[2]?.color || '#333', fontSize: '0.875rem', textAlign: 'right' }}>
              {players[2]?.name || 'Player 2'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="20s"
              name="2_twenties"
              type="number"
              value={scores[2]?.twenties !== undefined ? String(scores[2].twenties) : ''}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
              sx={{ marginY: '4px' }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Points"
              name="2_points"
              type="number"
              value={scores[2]?.points !== undefined ? String(scores[2].points) : ''}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
              sx={{ marginY: '4px' }}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2" align="center" sx={{ marginY: '4px', color: '#333', fontSize: '0.875rem' }}>
          Total 20s: {calculateTotalTwenties()}, Total Points: {calculateTotalPoints()}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleEndRoundSubmit}
          sx={{ marginTop: '4px', padding: '6px 0' }}
        >
          Submit Round
        </Button>
      </Grid>
    </Grid>
  );
};

export default ScoreInput;