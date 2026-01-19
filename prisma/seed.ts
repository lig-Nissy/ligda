import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  {
    id: "default",
    name: "一般",
    description: "一般的な言葉",
  },
  {
    id: "it",
    name: "IT用語",
    description: "プログラミング・IT関連の用語",
  },
];

const DEFAULT_WORDS = [
  { text: "寿司", reading: "すし", inputType: "hiragana", categoryId: "default", weightEasy: 2, weightNormal: 1, weightHard: 0 },
  { text: "タイピング", reading: "たいぴんぐ", inputType: "hiragana", categoryId: "default", weightEasy: 1, weightNormal: 2, weightHard: 1 },
  { text: "練習", reading: "れんしゅう", inputType: "hiragana", categoryId: "default", weightEasy: 1, weightNormal: 1, weightHard: 1 },
  { text: "キーボード", reading: "きーぼーど", inputType: "hiragana", categoryId: "default", weightEasy: 1, weightNormal: 2, weightHard: 1 },
  { text: "プログラミング", reading: "ぷろぐらみんぐ", inputType: "hiragana", categoryId: "default", weightEasy: 0, weightNormal: 1, weightHard: 2 },
  { text: "こんにちは", reading: "こんにちは", inputType: "hiragana", categoryId: "default", weightEasy: 2, weightNormal: 1, weightHard: 0 },
  { text: "ありがとう", reading: "ありがとう", inputType: "hiragana", categoryId: "default", weightEasy: 2, weightNormal: 1, weightHard: 1 },
  { text: "日本語", reading: "にほんご", inputType: "hiragana", categoryId: "default", weightEasy: 1, weightNormal: 1, weightHard: 1 },
  { text: "東京", reading: "とうきょう", inputType: "hiragana", categoryId: "default", weightEasy: 1, weightNormal: 1, weightHard: 1 },
  { text: "富士山", reading: "ふじさん", inputType: "hiragana", categoryId: "default", weightEasy: 1, weightNormal: 1, weightHard: 1 },
  { text: "container", reading: "container", inputType: "alphabet", categoryId: "it", weightEasy: 0, weightNormal: 1, weightHard: 2 },
  { text: "function", reading: "function", inputType: "alphabet", categoryId: "it", weightEasy: 1, weightNormal: 2, weightHard: 1 },
  { text: "variable", reading: "variable", inputType: "alphabet", categoryId: "it", weightEasy: 1, weightNormal: 2, weightHard: 1 },
  { text: "component", reading: "component", inputType: "alphabet", categoryId: "it", weightEasy: 0, weightNormal: 1, weightHard: 2 },
  { text: "interface", reading: "interface", inputType: "alphabet", categoryId: "it", weightEasy: 0, weightNormal: 1, weightHard: 2 },
];

async function main() {
  console.log("Seeding database...");

  // カテゴリを作成
  for (const category of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { id: category.id } });
    if (!existing) {
      await prisma.category.create({ data: category });
      console.log(`Created category: ${category.name}`);
    } else {
      console.log(`Category already exists: ${category.name}`);
    }
  }

  // ワードを作成
  for (const word of DEFAULT_WORDS) {
    const existing = await prisma.word.findFirst({
      where: { text: word.text, categoryId: word.categoryId },
    });
    if (!existing) {
      await prisma.word.create({ data: word });
      console.log(`Created word: ${word.text}`);
    } else {
      console.log(`Word already exists: ${word.text}`);
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
