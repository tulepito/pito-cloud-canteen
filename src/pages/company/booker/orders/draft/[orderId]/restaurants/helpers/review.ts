export const converRatingPointToLabel = (point: number) => {
  switch (point) {
    case 1:
      return 'Rất tệ';
    case 2:
      return 'Tệ';
    case 3:
      return 'Bình thường';
    case 4:
      return 'Hài lòng';
    case 5:
      return 'Rất hài lòng';
    default:
      break;
  }
};
