import { createInterface } from "readline";
import bcrypt from "bcryptjs";
import { kv } from "@vercel/kv";

const SALT_ROUNDS = 12;

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const password = await new Promise<string>((resolve) => {
    rl.question("새 관리자 비밀번호를 입력하세요: ", resolve);
  });

  const existing = await kv.get<string>("admin:password_hash");
  if (existing) {
    const confirm = await new Promise<string>((resolve) => {
      rl.question(
        "이미 비밀번호가 설정되어 있습니다. 덮어쓰시겠습니까? (y/N): ",
        resolve,
      );
    });
    if (confirm.toLowerCase() !== "y") {
      console.log("취소되었습니다.");
      rl.close();
      return;
    }
  }

  rl.close();

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  await kv.set("admin:password_hash", hash);
  console.log("관리자 비밀번호가 설정되었습니다.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
