export const SESSION_TITLE_MAP = {
    0: 'P1',
    1: 'P2 / Sprint Qualifying',
    2: 'P3 / Sprint Race',
    3: 'Race Quali',
    4: 'Race Day',
};

export const getF1Points = (position) => {
  const pointsTable = {
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
    6: 8, 7: 6, 8: 4, 9: 2, 10: 1
  };
  return pointsTable[position] || 0;
};
