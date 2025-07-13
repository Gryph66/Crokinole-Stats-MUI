import React, { useState } from "react";
import { TextField, Button, MenuItem, FormControl, InputLabel, Select, Grid, Typography, Paper, InputAdornment, Box } from '@mui/material';

const MetadataForm = ({ onSubmit }) => {
  const [metadata, setMetadata] = useState({
    matchId: "",
    date: "",
    tournamentName: "",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedPlayers = {
      1: metadata.players[0],
      2: metadata.players[1],
    };
    onSubmit({ ...metadata, players: formattedPlayers });
  };

  return (
    <Paper elevation={3} style={{ padding: "30px", maxWidth: "600px", margin: "30px auto" }}>
      <Typography variant="h5" gutterBottom align="center">Enter Game Metadata</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Match ID"
              name="matchId"
              value={metadata.matchId}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
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
              InputLabelProps={{ shrink: true, style: { fontSize: '1rem' } }} // Increased font size
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Tournament Name"
              name="tournamentName"
              value={metadata.tournamentName}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
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
            />
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
            />
          </Grid>
          {metadata.players.map((player, index) => (
            <Grid item xs={12} key={index}>
              <Typography variant="h6" gutterBottom>Player {index + 1}</Typography>
              <TextField
                label="Name"
                name="name"
                value={player.name}
                onChange={(e) => handlePlayerChange(index, e)}
                variant="outlined"
                fullWidth
                required
              />
              <FormControl fullWidth style={{ marginTop: "16px" }}>
                <TextField
                  label="Color"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box style={{ width: '20px', height: '20px', backgroundColor: player.color, border: '1px solid #ccc', borderRadius: '4px' }} />
                      </InputAdornment>
                    ),
                    type: "color",
                    style: { paddingLeft: '0' }, // Integrate swatch
                  }}
                  name="color"
                  value={player.color}
                  onChange={(e) => handlePlayerChange(index, e)}
                  InputLabelProps={{ style: { fontSize: '1rem' } }} // Increased font size
                />
              </FormControl>
              <FormControl fullWidth style={{ marginTop: "16px" }}>
                <InputLabel shrink style={{ fontSize: '1rem' }}>Side</InputLabel> {/* Increased font size and shrink for background */}
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
            <Button type="submit" variant="contained" color="primary" fullWidth>Submit</Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default MetadataForm;