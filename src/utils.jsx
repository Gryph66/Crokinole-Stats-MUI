export const classifyPosition = (x, y) => {
  const centerX = 300, centerY = 250; // Adjust based on canvas (500h, but board is 600w x 500h?)
  const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
  if (dist < 30) return "20-hole";
  if (dist < 120) return "15-ring";
  if (dist < 240) return "10-ring";
  if (dist < 360) return "5-ring";
  return "invalid"; // Adjust radii based on your RGB map/python script
};