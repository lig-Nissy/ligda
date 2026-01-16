// 管理者ユーザー（サーバーサイドのみで使用）
// 新規登録はこのファイルを直接編集して管理

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

// 管理者ユーザー一覧
// パスワードはbcryptでハッシュ化済み
// 新規追加時: node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('パスワード', 10));"
export const ADMIN_USERS: AdminUser[] = [
  {
    id: "1",
    email: "nishizawa_yuya@liginc.co.jp",
    name: "Nishizawa Yuya",
    // パスワード: admin123
    passwordHash: "$2b$10$PzlMBZFAtmhhstM17Li8ueb5IKV3pPtjuGiTwm4pLZ65C8YVOZtGO",
  },
];

export function findAdminByEmail(email: string): AdminUser | undefined {
  return ADMIN_USERS.find((user) => user.email === email);
}
