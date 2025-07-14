# Crokinole Game Tracker

![Crokinole Game Tracker Logo](docs/screenshots/disc_tracking.png) <!-- Optional: Replace with your app's logo or banner -->

The **Crokinole Game Tracker** is a web-based application designed to streamline the process of recording and analyzing Crokinole matches. Built with React and Material-UI, this app allows users to input game metadata, track shots on a virtual Crokinole board, manage scores, and export game data as JSON files for further analysis. Whether you're a tournament organizer, player, or enthusiast, this tool provides an intuitive interface to capture detailed game statistics efficiently.

## Features

- **Interactive Board Interface**: Click on a virtual Crokinole board to record shots, with automatic zone detection based on RGB color mapping.
- **Metadata Management**: Input player names, match ID, date, and tournament round to contextualize game data.
- **Real-Time Score Tracking**: Monitor shots, 20s, and points per round, with a clean Material-UI table summarizing player performance.
- **Shot Undo and Save**: Easily undo or save shots to correct mistakes or finalize moves, with buttons positioned for mouse efficiency.
- **JSON Export**: Export game data in a structured JSON format, with filenames following the convention `classified_FirstNamePlayer1FirstNamePlayer2_YearMatchID_TournamentRound.json` (e.g., `classified_ShawnDevon_2025CrokinoleCup_SemiFinal.json`).
- **Responsive Design**: Built with Material-UI for a professional, responsive UI that works across devices.

## Prerequisites

Before setting up the Crokinole Game Tracker, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher) or **yarn**
- **Git** (for cloning the repository)
- A modern web browser (e.g., Chrome, Firefox)

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/crokinole-game-tracker.git
   cd crokinole-game-tracker
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
- On the initial screen, input game details via the metadata form:
  - **Player Names**: First and last names for both players.
  - **Match ID**: Unique identifier for the match (e.g., `CrokinoleCup` or `WCC`).
  - **Date**: The date of the match.
  - **Tournament Round**: The round of the tournament (e.g., `Semi Final` or `3rd Place`).
- Click "Submit" to proceed to the game tracking interface.

*Note*: Ensure all fields are filled to generate accurate JSON filenames.

**Screenshot Placeholder**: Add a screenshot of the metadata entry form here to show the input fields and layout.

### 2. Track Shots
- **Select First Shooter**: Choose which player shoots first using the provided buttons.
- **Select Active Player**: Use the toggle buttons to switch between players during the round.
- **Record Shots**: Click on the virtual Crokinole board (canvas) to place discs. The app automatically detects the zone (e.g., Gutter, Outer Ring, 20s) based on RGB values.
- **Undo/Save Shots**: Use the "Undo Last Shot" and "Save Shot" buttons, located above the board alongside player selection, to manage shots efficiently.
- **View Stats**: A table below the board displays real-time shot counts and 20s for each player.

**Screenshot Placeholder**: Add a screenshot of the game tracking interface, showing the board, buttons, player selection, and stats table.

### 3. End Round
- When both players have taken 8 shots each (16 total), the round ends automatically.
- Input final scores for each player (20s and points) in the score input form.
- Submit to proceed to the next round.

**Screenshot Placeholder**: Add a screenshot of the end-of-round score input form.

### 4. Export Game Data
- Click the "End Game" button to export the game data as a JSON file.
- The filename follows the format `classified_FirstNamePlayer1FirstNamePlayer2_YearMatchID_TournamentRound.json` (e.g., `classified_ShawnDevon_2025CrokinoleCup_SemiFinal.json`).
- The filename is displayed above the "End Game" button for verification before export.

**Screenshot Placeholder**: Add a screenshot showing the "End Game" button and the filename display.

### 5. Review Exported Data
- The exported JSON file contains:
  - `metadata`: Player names, match ID, date, and tournament round.
  - `rounds`: Array of rounds with shot data, scores, and board states.
- Use the JSON file for analysis, sharing, or importing into other tools.

## Project Structure

```
crokinole-game-tracker/
├── public/
│   ├── crokinole_board.png       # Crokinole board image
│   ├── crokinole_board_colored.png  # Colored board for zone detection
│   └── index.html
├── src/
│   ├── BoardState.jsx            # Main game tracking component
│   ├── MetadataForm.jsx          # Form for entering game metadata
│   ├── ScoreInput.jsx            # Component for end-of-round scoring
│   ├── ShooterSelection.jsx       # Player selection component
│   ├── theme.js                  # Material-UI theme configuration
│   └── app.jsx                   # Root component
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
5. Open a pull request with a detailed description of your changes.

Please ensure your code follows the existing style and includes tests where applicable.

## Issues

If you encounter bugs or have feature requests, please open an issue on the [GitHub repository](https://github.com/your-username/crokinole-game-tracker/issues). Include:
- A clear description of the issue.
- Steps to reproduce.
- Any relevant screenshots or logs.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with inspiration from the Crokinole community.
- Thanks to [Material-UI](https://mui.com/) for providing a robust component library.
- Special thanks to contributors and testers who helped refine the application.

---

*Happy Crokinole tracking! For questions or feedback, contact [your-email@example.com] or open an issue on GitHub.*