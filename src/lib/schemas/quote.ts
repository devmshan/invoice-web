import { z } from "zod";

// Notion 페이지 ID는 UUID v4가 아닐 수 있으므로 일반 UUID 형식으로 검증
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const pageIdSchema = z
  .string()
  .regex(UUID_REGEX, "유효하지 않은 페이지 ID 형식입니다.");
