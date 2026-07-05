export const PLAYER_COLORS = {
  RED: 'red',
  GREEN: 'green',
  YELLOW: 'yellow',
  BLUE: 'blue'
};

export const PLAYER_CONFIGS = {
  [PLAYER_COLORS.RED]: {
    id: PLAYER_COLORS.RED,
    name: 'Red (Cherry Bomb)',
    displayName: 'Cerezas',
    colorHex: '#ef4444', // Red
    bgPosition: '0% 0%',
    startCellIndex: 0,
    homeEntranceIndex: 50,
    textColor: 'text-red-500',
    lightColorHex: '#fecaca',
    themeColor: 'rgb(239, 68, 68)'
  },
  [PLAYER_COLORS.GREEN]: {
    id: PLAYER_COLORS.GREEN,
    name: 'Green (Peashooter)',
    displayName: 'Lanzaguisantes',
    colorHex: '#22c55e', // Green
    bgPosition: '100% 0%',
    startCellIndex: 13,
    homeEntranceIndex: 11,
    textColor: 'text-green-500',
    lightColorHex: '#bbf7d0',
    themeColor: 'rgb(34, 197, 94)'
  },
  [PLAYER_COLORS.YELLOW]: {
    id: PLAYER_COLORS.YELLOW,
    name: 'Yellow (Sunflower)',
    displayName: 'Girasol',
    colorHex: '#eab308', // Yellow
    bgPosition: '100% 100%',
    startCellIndex: 26,
    homeEntranceIndex: 24,
    textColor: 'text-yellow-500',
    lightColorHex: '#fef08a',
    themeColor: 'rgb(234, 179, 8)'
  },
  [PLAYER_COLORS.BLUE]: {
    id: PLAYER_COLORS.BLUE,
    name: 'Blue (Snow Pea)',
    displayName: 'Hielaguisantes',
    colorHex: '#3b82f6', // Blue
    bgPosition: '0% 100%',
    startCellIndex: 39,
    homeEntranceIndex: 37,
    textColor: 'text-blue-500',
    lightColorHex: '#bfdbfe',
    themeColor: 'rgb(59, 130, 246)'
  }
};

// 15x15 Ludo Board Grid coordinate list (row, col) for the 52 outer track cells
// Traced clockwise starting from cell 0 (Red Start: row 6, col 1)
export const BOARD_PATH = [
  { row: 6, col: 1 },   // 0: Red Start
  { row: 6, col: 2 },   // 1
  { row: 6, col: 3 },   // 2
  { row: 6, col: 4 },   // 3
  { row: 6, col: 5 },   // 4
  { row: 5, col: 6 },   // 5
  { row: 4, col: 6 },   // 6
  { row: 3, col: 6 },   // 7
  { row: 2, col: 6 },   // 8
  { row: 1, col: 6 },   // 9
  { row: 0, col: 6 },   // 10
  { row: 0, col: 7 },   // 11: Green Home Entrance (for other colors: crossing)
  { row: 0, col: 8 },   // 12
  { row: 1, col: 8 },   // 13: Green Start
  { row: 2, col: 8 },   // 14
  { row: 3, col: 8 },   // 15
  { row: 4, col: 8 },   // 16
  { row: 5, col: 8 },   // 17
  { row: 6, col: 9 },   // 18
  { row: 6, col: 10 },  // 19
  { row: 6, col: 11 },  // 20
  { row: 6, col: 12 },  // 21
  { row: 6, col: 13 },  // 22
  { row: 6, col: 14 },  // 23
  { row: 7, col: 14 },  // 24: Yellow Home Entrance
  { row: 8, col: 14 },  // 25
  { row: 8, col: 13 },  // 26: Yellow Start
  { row: 8, col: 12 },  // 27
  { row: 8, col: 11 },  // 28
  { row: 8, col: 10 },  // 29
  { row: 8, col: 9 },   // 30
  { row: 9, col: 8 },   // 31
  { row: 10, col: 8 },  // 32
  { row: 11, col: 8 },  // 33
  { row: 12, col: 8 },  // 34
  { row: 13, col: 8 },  // 35
  { row: 14, col: 8 },  // 36
  { row: 14, col: 7 },  // 37: Blue Home Entrance
  { row: 14, col: 6 },  // 38
  { row: 13, col: 6 },  // 39: Blue Start
  { row: 12, col: 6 },  // 40
  { row: 11, col: 6 },  // 41
  { row: 10, col: 6 },  // 42
  { row: 9, col: 6 },   // 43
  { row: 8, col: 5 },   // 44
  { row: 8, col: 4 },   // 45
  { row: 8, col: 3 },   // 46
  { row: 8, col: 2 },   // 47
  { row: 8, col: 1 },   // 48
  { row: 8, col: 0 },   // 49
  { row: 7, col: 0 },   // 50: Red Home Entrance
  { row: 6, col: 0 }    // 51
];

// Home paths leading to final home centers (5 tiles each)
export const HOME_PATHS = {
  [PLAYER_COLORS.RED]: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 }
  ],
  [PLAYER_COLORS.GREEN]: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 }
  ],
  [PLAYER_COLORS.YELLOW]: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 }
  ],
  [PLAYER_COLORS.BLUE]: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 }
  ]
};

// Home center target tile for each color
export const HOME_CENTERS = {
  [PLAYER_COLORS.RED]: { row: 7, col: 6 },
  [PLAYER_COLORS.GREEN]: { row: 6, col: 7 },
  [PLAYER_COLORS.YELLOW]: { row: 7, col: 8 },
  [PLAYER_COLORS.BLUE]: { row: 8, col: 7 }
};

// Fractional grid positions for the 4 flowerpots inside base yards (rows/cols 0-14)
export const BASE_POTS = {
  [PLAYER_COLORS.RED]: [
    { row: 1.55, col: 1.55 },
    { row: 1.55, col: 3.55 },
    { row: 3.55, col: 1.55 },
    { row: 3.55, col: 3.55 }
  ],
  [PLAYER_COLORS.GREEN]: [
    { row: 1.55, col: 10.45 },
    { row: 1.55, col: 12.45 },
    { row: 3.55, col: 10.45 },
    { row: 3.55, col: 12.45 }
  ],
  [PLAYER_COLORS.YELLOW]: [
    { row: 10.45, col: 10.45 },
    { row: 10.45, col: 12.45 },
    { row: 12.45, col: 10.45 },
    { row: 12.45, col: 12.45 }
  ],
  [PLAYER_COLORS.BLUE]: [
    { row: 10.45, col: 1.55 },
    { row: 10.45, col: 3.55 },
    { row: 12.45, col: 1.55 },
    { row: 12.45, col: 3.55 }
  ]
};

// Safe tiles where pieces cannot be captured (star tiles or starting positions)
// On this custom board: starting tiles (0, 13, 26, 39) + some safe tiles (e.g. 8, 21, 34, 47)
export const SAFE_CELLS = [0, 8, 13, 21, 26, 34, 39, 47];
