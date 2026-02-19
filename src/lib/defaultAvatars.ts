// Default avatar bank using user-provided sprite sheets
// Sheet 1: 4 columns × 3 rows = 12 avatars
// Sheet 2: 5 columns × 4 rows = 20 avatars (row 2 has only 4, but we treat as 5 cols)

export interface BankAvatar {
  id: number;
  sheet: string;
  row: number;
  col: number;
  cols: number;
  rows: number;
  label: string;
}

const SHEET1 = "/avatars/sheet1.png";
const SHEET2 = "/avatars/sheet2.png";

// Sheet 1: 4 cols × 3 rows
const sheet1Avatars: BankAvatar[] = [
  { id: 1,  sheet: SHEET1, row: 0, col: 0, cols: 4, rows: 3, label: "Тренер" },
  { id: 2,  sheet: SHEET1, row: 0, col: 1, cols: 4, rows: 3, label: "Нутрициолог" },
  { id: 3,  sheet: SHEET1, row: 0, col: 2, cols: 4, rows: 3, label: "Аналитик" },
  { id: 4,  sheet: SHEET1, row: 0, col: 3, cols: 4, rows: 3, label: "Скаут" },
  { id: 5,  sheet: SHEET1, row: 1, col: 0, cols: 4, rows: 3, label: "Тренер вратарей" },
  { id: 6,  sheet: SHEET1, row: 1, col: 1, cols: 4, rows: 3, label: "Тактический аналитик" },
  { id: 7,  sheet: SHEET1, row: 1, col: 2, cols: 4, rows: 3, label: "Комментатор" },
  { id: 8,  sheet: SHEET1, row: 1, col: 3, cols: 4, rows: 3, label: "Физиотерапевт" },
  { id: 9,  sheet: SHEET1, row: 2, col: 0, cols: 4, rows: 3, label: "Менеджер" },
  { id: 10, sheet: SHEET1, row: 2, col: 1, cols: 4, rows: 3, label: "Тренер-женщина" },
  { id: 11, sheet: SHEET1, row: 2, col: 2, cols: 4, rows: 3, label: "Молодой скаут" },
  { id: 12, sheet: SHEET1, row: 2, col: 3, cols: 4, rows: 3, label: "Учёный" },
];

// Sheet 2: 5 cols × 4 rows
const sheet2Avatars: BankAvatar[] = [
  { id: 13, sheet: SHEET2, row: 0, col: 0, cols: 5, rows: 4, label: "Менеджер" },
  { id: 14, sheet: SHEET2, row: 0, col: 1, cols: 5, rows: 4, label: "Видеоаналитик" },
  { id: 15, sheet: SHEET2, row: 0, col: 2, cols: 5, rows: 4, label: "IT-специалист" },
  { id: 16, sheet: SHEET2, row: 0, col: 3, cols: 5, rows: 4, label: "Врач" },
  { id: 17, sheet: SHEET2, row: 0, col: 4, cols: 5, rows: 4, label: "Директор" },
  { id: 18, sheet: SHEET2, row: 1, col: 0, cols: 5, rows: 4, label: "Доктор" },
  { id: 19, sheet: SHEET2, row: 1, col: 1, cols: 5, rows: 4, label: "Фотограф" },
  { id: 20, sheet: SHEET2, row: 1, col: 2, cols: 5, rows: 4, label: "Исследователь" },
  { id: 21, sheet: SHEET2, row: 1, col: 3, cols: 5, rows: 4, label: "HR-менеджер" },
  { id: 22, sheet: SHEET2, row: 2, col: 0, cols: 5, rows: 4, label: "Тренер" },
  { id: 23, sheet: SHEET2, row: 2, col: 1, cols: 5, rows: 4, label: "Аналитик" },
  { id: 24, sheet: SHEET2, row: 2, col: 2, cols: 5, rows: 4, label: "Главный тренер" },
  { id: 25, sheet: SHEET2, row: 2, col: 3, cols: 5, rows: 4, label: "Видеооператор" },
  { id: 26, sheet: SHEET2, row: 2, col: 4, cols: 5, rows: 4, label: "Скаут" },
  { id: 27, sheet: SHEET2, row: 3, col: 0, cols: 5, rows: 4, label: "Администратор" },
  { id: 28, sheet: SHEET2, row: 3, col: 1, cols: 5, rows: 4, label: "Аналитик данных" },
  { id: 29, sheet: SHEET2, row: 3, col: 2, cols: 5, rows: 4, label: "S&C тренер" },
  { id: 30, sheet: SHEET2, row: 3, col: 3, cols: 5, rows: 4, label: "Аналитик" },
  { id: 31, sheet: SHEET2, row: 3, col: 4, cols: 5, rows: 4, label: "Ментор" },
];

export const AVATAR_BANK: BankAvatar[] = [...sheet1Avatars, ...sheet2Avatars];

/**
 * Get CSS background styles for rendering a bank avatar.
 */
export function getAvatarStyle(avatar: BankAvatar): React.CSSProperties {
  const bgSizeX = avatar.cols * 100;
  const bgSizeY = avatar.rows * 100;
  const posX = avatar.cols > 1 ? (avatar.col / (avatar.cols - 1)) * 100 : 0;
  const posY = avatar.rows > 1 ? (avatar.row / (avatar.rows - 1)) * 100 : 0;

  return {
    backgroundImage: `url(${avatar.sheet})`,
    backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
    backgroundPosition: `${posX}% ${posY}%`,
    backgroundRepeat: "no-repeat",
  };
}

/**
 * Encode a bank avatar selection as a string for storage.
 * Format: "bank:{id}"
 */
export function encodeBankAvatar(id: number): string {
  return `bank:${id}`;
}

/**
 * Check if a URL is a bank avatar reference.
 */
export function isBankAvatar(url: string | null | undefined): boolean {
  return !!url && url.startsWith("bank:");
}

/**
 * Get the BankAvatar object from an encoded string.
 */
export function decodeBankAvatar(url: string): BankAvatar | null {
  if (!isBankAvatar(url)) return null;
  const id = parseInt(url.replace("bank:", ""), 10);
  return AVATAR_BANK.find(a => a.id === id) || null;
}

/**
 * Get a deterministic default avatar based on a string id (for profiles without avatar).
 */
export function getDefaultAvatar(id: string): BankAvatar {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % AVATAR_BANK.length;
  return AVATAR_BANK[index];
}
