import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
  .max(72, "비밀번호는 최대 72자까지 가능합니다.")
  .regex(/[A-Z]/, "대문자를 최소 1개 포함해야 합니다.")
  .regex(/[a-z]/, "소문자를 최소 1개 포함해야 합니다.")
  .regex(/[0-9]/, "숫자를 최소 1개 포함해야 합니다.")
  .regex(/[^A-Za-z0-9]/, "특수문자를 최소 1개 포함해야 합니다.");

export const loginSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해 주세요."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해 주세요."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });
