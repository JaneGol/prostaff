// Default avatar bank for specialist cards
// Each avatar is a flat vector illustration of a sport professional

import avatar01 from "@/assets/avatars/avatar-01.png";
import avatar02 from "@/assets/avatars/avatar-02.png";
import avatar03 from "@/assets/avatars/avatar-03.png";
import avatar04 from "@/assets/avatars/avatar-04.png";
import avatar05 from "@/assets/avatars/avatar-05.png";
import avatar06 from "@/assets/avatars/avatar-06.png";
import avatar07 from "@/assets/avatars/avatar-07.png";
import avatar08 from "@/assets/avatars/avatar-08.png";
import avatar09 from "@/assets/avatars/avatar-09.png";
import avatar10 from "@/assets/avatars/avatar-10.png";
import avatar11 from "@/assets/avatars/avatar-11.png";
import avatar12 from "@/assets/avatars/avatar-12.png";
import avatar13 from "@/assets/avatars/avatar-13.png";
import avatar14 from "@/assets/avatars/avatar-14.png";
import avatar15 from "@/assets/avatars/avatar-15.png";
import avatar16 from "@/assets/avatars/avatar-16.png";
import avatar17 from "@/assets/avatars/avatar-17.png";
import avatar18 from "@/assets/avatars/avatar-18.png";
import avatar19 from "@/assets/avatars/avatar-19.png";
import avatar20 from "@/assets/avatars/avatar-20.png";
import avatar21 from "@/assets/avatars/avatar-21.png";
import avatar22 from "@/assets/avatars/avatar-22.png";
import avatar23 from "@/assets/avatars/avatar-23.png";
import avatar24 from "@/assets/avatars/avatar-24.png";
import avatar25 from "@/assets/avatars/avatar-25.png";
import avatar26 from "@/assets/avatars/avatar-26.png";
import avatar27 from "@/assets/avatars/avatar-27.png";
import avatar28 from "@/assets/avatars/avatar-28.png";
import avatar29 from "@/assets/avatars/avatar-29.png";
import avatar30 from "@/assets/avatars/avatar-30.png";
import avatar31 from "@/assets/avatars/avatar-31.png";
import avatar32 from "@/assets/avatars/avatar-32.png";

export const DEFAULT_AVATARS = [
  avatar01, avatar02, avatar03, avatar04, avatar05, avatar06, avatar07, avatar08,
  avatar09, avatar10, avatar11, avatar12, avatar13, avatar14, avatar15, avatar16,
  avatar17, avatar18, avatar19, avatar20, avatar21, avatar22, avatar23, avatar24,
  avatar25, avatar26, avatar27, avatar28, avatar29, avatar30, avatar31, avatar32,
] as const;

/**
 * Get a deterministic default avatar based on a string id.
 * Returns a consistent avatar for the same id every time.
 */
export function getDefaultAvatar(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index];
}
