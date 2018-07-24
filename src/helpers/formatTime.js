function formatTime(timeStr) {
  const parts = timeStr.split(":");

  // Add minutes if we only have hours
  if (parts.length === 1) {
    parts.push("00");
  }

  // Only keep the first two parts
  return [parts[0], parts[1]].join(":");
}

export default formatTime;
