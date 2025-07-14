# Crokinole Stats MUI

![Crokinole Stats MUI Logo](docs/screenshots/logo.png) <!-- Optional: Replace with your app's logo or banner -->

**Crokinole Stats MUI** is a modern, web-based application designed to streamline the tracking and analysis of Crokinole matches. Built with React and Material-UI, this tool enables users to input game metadata, record shots on an interactive virtual Crokinole board, manage scores, and export detailed game data as JSON files. Ideal for tournament organizers, players, and enthusiasts, it provides a polished, user-friendly interface for capturing comprehensive match statistics.

## Live Demo

Try the app live at [https://crokinole-shots.replit.app/](https://crokinole-shots.replit.app/).  
*Note*: Hosted on Replit, the demo may require a refresh to ensure images (e.g., the Crokinole board) load correctly.

## Video Demonstration

Watch a demonstration of the app in action, tracking a Crokinole match from the Turtle Island 2017 tournament:  
[View Video on Dropbox](https://www.dropbox.com/scl/fi/de8f3a9ac0grrsuzl2bll/example_shottracking_turtleisland2017.mov?rlkey=s7lh3huohseutsv3wenwh7odb&st=q53sg3sy&dl=0)  
*Note*: Ensure you have a Dropbox-compatible media player to view the `.mov` file. The video reflects an earlier version of the app; the current version includes a more compact metadata form.

## Features

- **Interactive Crokinole Board**: Record shots by clicking on a virtual board, with automatic zone detection (e.g., Gutter, Outer Ring, 20s) using RGB color mapping.
- **Streamlined Metadata Entry**: Input player names, match ID, date, tournament round, and YouTube link in a compact form, with an automatically generated "Tournament Name" (e.g., `Crokinole Cup 2025`) displayed in a small font for verification.
- **Real-Time Score Tracking**: Monitor shots and 20s per round in a clean Material-UI table, with intuitive controls for shot management.
- **Efficient Shot Management**: Use "Undo Last Shot" and "Save Shot" buttons, positioned above the board alongside player selection, for optimal mouse efficiency.
- **JSON Export**: Export game data in a structured JSON format with filenames like `classified_FirstNamePlayer1FirstNamePlayer2_YearMatchID_TournamentRound.json` (e.g., `classified_ShawnDevon_2025CrokinoleCup_SemiFinal.json`).
- **Responsive Design**: Leverages Material-UI for a professional, compact, and responsive UI that fits most standard displays.

## Prerequisites

Before setting up Crokinole Stats MUI, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher) or **yarn**
- **Git** (for cloning the repository)
- A modern web browser (e.g., Chrome, Firefox)

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Gryph66/Crokinole-Stats-MUI.git
   cd Crokinole-Stats-MUI
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Start the Development Server**:
   ```bash
   npm start
   ```
   or
   ```bash
   yarn start
   ```
   The app will open in your default browser at `http://localhost:3000`.

## Usage

### 1. Enter Game Metadata
- On the metadata entry screen, provide the following details in a compact form:
  - **Match ID**: Unique identifier for the match (e.g., `Crokinole Cup` or `WCC`).
  - **Date**: The match date (e.g., `2025-07-07`).
  - **Tournament Round**: The round of the tournament (e.g., `Semi Final` or `3rd Place`).
  - **YouTube Link**: A link to the match video.
  - **Player Names and Details**: Names and board sides (Top/Bottom) for both players, with color pickers (~20% width) beside names (~80% width) for efficiency.
- The "Tournament Name" (e.g., `Crokinole Cup 2025`) is automatically generated from the Match ID and year, displayed in a small font above the YouTube Link field for verification.
- Click "Submit" to proceed to the game tracking interface.

**Screenshot Placeholder**: Add a screenshot of the metadata entry form here, showing the compact layout with "Tournament Name" above the YouTube Link field and side-by-side name/color fields (`docs/screenshots/metadata-form.png`).

### 2. Track Shots
- **Select First Shooter**: Choose which player shoots first using the provided buttons.
- **Select Active Player**: Toggle between players using buttons above the board.
- **Record Shots**: Click on the virtual Crokinole board to place discs, with zones automatically detected based on RGB values.
- **Manage Shots**: Use "Undo Last Shot" and "Save Shot" buttons, located above the board alongside player selection, for efficient shot management.
- **View Stats**: A table below the board displays real-time shot counts and 20s for each player.

**Screenshot Placeholder**: Add a screenshot of the game tracking interface, showing the board, buttons, player selection, and stats table (`docs/screenshots/game-tracking.png`).

### 3. End Round
- After both players take 8 shots (16 total), the round ends automatically.
- Enter final scores (20s and points) for each player in the score input form.
- Submit to start the next round.

**Screenshot Placeholder**: Add a screenshot of the end-of-round score input form (`docs/screenshots/score-input.png`).

### 4. Export Game Data
- Click the "End Game" button to export the game data as a JSON file.
- The filename is displayed above the button (e.g., `classified_ShawnDevon_2025CrokinoleCup_SemiFinal.json`) for verification.
- The JSON includes metadata (players, match ID, date, tournament name, etc.) and round data (shots, scores).

**Screenshot Placeholder**: Add a screenshot showing the "End Game" button and filename display (`docs/screenshots/export.png`).

### 5. Review Exported Data
- The exported JSON file contains:
  - `metadata`: Player details, match ID, date, tournament name (`tournamentName`), and round.
  - `rounds`: Array of rounds with shot data and scores.
- Use the JSON for analysis, sharing, or importing into other tools.

## Project Structure

```
Crokinole-Stats-MUI/
├── public/
│   ├── crokinole_board.png          # Crokinole board image
│   ├── crokinole_board_colored.png  # Colored board for zone detection
│   └── index.html
├── src/
│   ├── BoardState.jsx               # Main game tracking component
│   ├── MetadataForm.jsx             # Form for entering game metadata
│   ├── ScoreInput.jsx               # Component for end-of-round scoring
│   ├── ShooterSelection.jsx         # Player selection component
│   ├── theme.js                     # Material-UI theme configuration
│   └── App.jsx                      # Root component
├── package.json
└── README.md
```

## Dependencies

- **React**: Frontend framework for building the UI.
- **Material-UI**: Provides professional, responsive components and theming.
- **Canvas API**: Used for rendering the Crokinole board and tracking shots.

See `package.json` for a full list of dependencies.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a pull request on [GitHub](https://github.com/Gryph66/Crokinole-Stats-MUI/pulls) with a detailed description of your changes.

Please ensure your code follows the existing style and includes tests where applicable.

## Issues

If you encounter bugs or have feature requests, please open an issue on the [GitHub repository](https://github.com/Gryph66/Crokinole-Stats-MUI/issues). Include:
- A clear description of the issue.
- Steps to reproduce.
- Any relevant screenshots or logs.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for the Crokinole community to enhance match tracking and analysis.
- Thanks to [Material-UI](https://mui.com/) for a robust component library.
- Special thanks to contributors and testers who helped refine the application.

---

*Happy Crokinole tracking! For questions or feedback, open an issue on [GitHub](https://github.com/Gryph66/Crokinole-Stats-MUI/issues).*