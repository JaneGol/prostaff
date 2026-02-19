// Default avatar bank using individual PNG files

export interface BankAvatar {
  id: number;
  src: string;
  label: string;
}

// Full bank for picker (keeps all 16 themed icons + 2 default silhouettes)
export const AVATAR_BANK: BankAvatar[] = [
  { id: 17, src: "/avatars/default-male.png",   label: "Мужской силуэт" },
  { id: 18, src: "/avatars/default-female.png",  label: "Женский силуэт" },
  { id: 1,  src: "/avatars/avatar-01.png", label: "Главный тренер" },
  { id: 2,  src: "/avatars/avatar-02.png", label: "Тактический аналитик" },
  { id: 3,  src: "/avatars/avatar-03.png", label: "IT-специалист" },
  { id: 4,  src: "/avatars/avatar-04.png", label: "Тренер-женщина" },
  { id: 5,  src: "/avatars/avatar-05.png", label: "Директор" },
  { id: 6,  src: "/avatars/avatar-06.png", label: "Врач-женщина" },
  { id: 7,  src: "/avatars/avatar-07.png", label: "Видеооператор" },
  { id: 8,  src: "/avatars/avatar-08.png", label: "Аналитик данных" },
  { id: 9,  src: "/avatars/avatar-09.png", label: "Спортивный врач" },
  { id: 10, src: "/avatars/avatar-10.png", label: "S&C тренер" },
  { id: 11, src: "/avatars/avatar-11.png", label: "Физиотерапевт" },
  { id: 12, src: "/avatars/avatar-12.png", label: "Тренер вратарей" },
  { id: 13, src: "/avatars/avatar-13.png", label: "Старший тренер" },
  { id: 14, src: "/avatars/avatar-14.png", label: "Фитнес-тренер" },
  { id: 15, src: "/avatars/avatar-15.png", label: "Тактический аналитик-женщина" },
  { id: 16, src: "/avatars/avatar-16.png", label: "Спортивный реабилитолог" },
];

/** The two default silhouettes used when no avatar is chosen */
export const DEFAULT_AVATARS: BankAvatar[] = [
  AVATAR_BANK[0], // male
  AVATAR_BANK[1], // female
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
 * Get a deterministic default avatar (male or female silhouette) based on a string id.
 */
export function getDefaultAvatar(id: string): BankAvatar {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index];
}
