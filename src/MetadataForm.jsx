import React, { useState } from "react";
import { TextField, Button, MenuItem, FormControl, InputLabel, Select, Grid, Typography, Paper } from '@mui/material';

const MetadataForm = ({ onSubmit }) => {
  const [metadata, setMetadata] = useState({
    matchId: "",
    date: "",
    tournamentRound: "",
    youtubeLink: "",
    players: [
      { name: "", color: "#000000", side: "Top" },
      { name: "", color: "#FF0000", side: "Bottom" },
    ],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetadata((prevMetadata) => ({
      ...prevMetadata,
      [name]: value,
    }));
  };

  const handlePlayerChange = (index, e) => {
    const { name, value } = e.target;
    const updatedPlayers = [...metadata.players];
    updatedPlayers[index] = {
      ...updatedPlayers[index],
      [name]: value,
    };
    setMetadata((prevMetadata) => ({
      ...prevMetadata,
      players: updatedPlayers,
    }));
  };

  const getTournamentName = () => {
    const year = metadata.date ? new Date(metadata.date).getFullYear() : 'UnknownYear';
    const matchId = metadata.matchId || 'UnknownMatch';
    return `${matchId} ${year}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedPlayers = {
      1: metadata.players[0],
      2: metadata.players[1],
    };
    onSubmit({
      ...metadata,
      players: formattedPlayers,
      tournamentName: getTournamentName(), // Use tournamentName for historical JSON compatibility
    });
  };

  return (
    <Paper elevation={3} style={{ padding: "20px", maxWidth: "500px", margin: "20px auto" }}>
      <Typography variant="h6" align="center" sx={{ marginBottom: '8px' }}>Enter Game Metadata</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              label="Match ID"
              name="matchId"
              value={metadata.matchId}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
              sx={{ marginY: '4px' }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              type="date"
              label="Date"
              name="date"
              value={metadata.date}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
              sx={{ marginY: '4px' }}
              InputLabelProps={{ shrink: true, style: { fontSize: '0.9rem' } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Tournament Round"
              name="tournamentRound"
              value={metadata.tournamentRound}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              sx={{ marginY: '4px' }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" align="center" sx={{ marginY: '4px', color: '#333', display: 'block' }}>
              Tournament Name: {getTournamentName()}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="YouTube Link"
              name="youtubeLink"
              value={metadata.youtubeLink}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
              sx={{ marginY: '4px' }}
            />
          </Grid>
          {metadata.players.map((player, index) => (
            <Grid item xs={12} key={index}>
              <Typography variant="h6" sx={{ marginY: '4px' }}>Player {index + 1}</Typography>
              <Grid container spacing={1}>
                <Grid item xs={9.6}>
                  <TextField
                    label="Name"
                    name="name"
                    value={player.name}
                    onChange={(e) => handlePlayerChange(index, e)}
                    variant="outlined"
                    fullWidth
                    required
                    sx={{ marginY: '4px' }}
                  />
                </Grid>
                <Grid item xs={2.4}>
                  <TextField
                    type="color"
                    name="color"
                    value={player.color}
                    onChange={(e) => handlePlayerChange(index, e)}
                    variant="outlined"
                    fullWidth
                    sx={{ marginY: '4px' }}
                    inputProps={{ style: { padding: '0', height: '36px' } }} // Compact color picker
                  />
                </Grid>
              </Grid>
              <FormControl fullWidth style={{ marginTop: "4px" }}>
                <InputLabel shrink style={{ fontSize: '0.9rem' }}>Side</InputLabel>
                <Select
                  name="side"
                  value={player.side}
                  onChange={(e) => handlePlayerChange(index, e)}
                  required
                  variant="outlined"
                >
                  <MenuItem value="Top">Top</MenuItem>
                  <MenuItem value="Bottom">Bottom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: '4px' }}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default MetadataForm;