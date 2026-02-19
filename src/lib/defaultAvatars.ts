// Default avatar bank using individual PNG files

export interface BankAvatar {
  id: number;
  src: string;
  label: string;
}

export const AVATAR_BANK: BankAvatar[] = [
  { id: 1,  src: "/avatars/avatar-01.png", label: "Тренер" },
  { id: 2,  src: "/avatars/avatar-02.png", label: "Тактический аналитик" },
  { id: 3,  src: "/avatars/avatar-03.png", label: "IT-специалист" },
  { id: 4,  src: "/avatars/avatar-04.png", label: "Тренер-женщина" },
  { id: 5,  src: "/avatars/avatar-05.png", label: "Директор" },
  { id: 6,  src: "/avatars/avatar-06.png", label: "Врач" },
  { id: 7,  src: "/avatars/avatar-07.png", label: "Видеооператор" },
  { id: 8,  src: "/avatars/avatar-08.png", label: "Аналитик данных" },
  { id: 9,  src: "/avatars/avatar-09.png", label: "Главный тренер" },
  { id: 10, src: "/avatars/avatar-10.png", label: "S&C тренер" },
];

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
