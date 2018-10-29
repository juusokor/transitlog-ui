export const findJourneyStartPosition = (journeyPositions) => {
  // Default to the first hfp event, ie when the data stream from this vehicle started
  let journeyStartPosition = journeyPositions[0];

  if (!journeyStartPosition) {
    return null;
  }

  for (let i = 1; i < journeyPositions.length; i++) {
    const current = journeyPositions[i];

    // Loop through the positions and find when the next_stop_id prop changes.
    // The hfp event BEFORE this is when the journey started, ie when
    // the vehicle departed the first terminal.
    if (current && current.next_stop_id !== journeyStartPosition.next_stop_id) {
      journeyStartPosition = journeyPositions[i - 1];
      break;
    }
  }

  return journeyStartPosition;
};
