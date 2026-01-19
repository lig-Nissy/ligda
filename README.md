# リグ打

日本語タイピング練習アプリケーション

## 機能

- タイピングゲーム（難易度選択：かんたん/ふつう/むずかしい）
- カテゴリ別ワード（一般、IT用語など）
- ランキング機能
- 管理画面（ワード/カテゴリの管理）

## 技術スタック

- Next.js 16
- Prisma 7 (PostgreSQL)
- Supabase
- NextAuth (管理者認証)
- Tailwind CSS

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルを作成し、以下を設定：

```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:5432/postgres"
DIRECT_URL="postgresql://[USER]:[PASSWORD]@[HOST]:5432/postgres"
```

### 3. データベースのセットアップ

```bash
# スキーマをDBに反映
npx prisma db push

# シードデータの投入
npm run db:seed
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:4000 でアクセス可能

## Vercelデプロイ

### 環境変数

Vercelの設定で以下の環境変数を追加：

- `DATABASE_URL`: Supabaseの接続文字列（Session Pooler使用推奨）

### ビルド

`npm run build` 実行時に自動で `prisma generate` が実行されます。

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 (port 4000) |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run db:seed` | シードデータ投入 |

## データベース構造

### Ranking
ランキングデータを格納

| カラム | 型 | 説明 |
|-------|-----|------|
| id | String | 主キー |
| nickname | String | ニックネーム |
| score | Int | スコア |
| difficulty | String | 難易度 (easy/normal/hard) |
| accuracy | Float | 正確率 |
| wordsPerMinute | Float | WPM |
| totalWords | Int | 総ワード数 |

### Category
ワードのカテゴリ

| カラム | 型 | 説明 |
|-------|-----|------|
| id | String | 主キー |
| name | String | カテゴリ名 |
| description | String | 説明 |

### Word
タイピング用ワード

| カラム | 型 | 説明 |
|-------|-----|------|
| id | String | 主キー |
| text | String | 表示テキスト |
| reading | String | 読み（入力用） |
| inputType | String | 入力タイプ (hiragana/alphabet) |
| categoryId | String | カテゴリID |
| weightEasy | Int | かんたんの重み |
| weightNormal | Int | ふつうの重み |
| weightHard | Int | むずかしいの重み |

## API エンドポイント

| エンドポイント | メソッド | 説明 |
|---------------|---------|------|
| `/api/ranking` | GET/POST | ランキング取得/追加 |
| `/api/ranking/count` | GET | ランキング件数取得 |
| `/api/ranking/clear` | DELETE | ランキング全削除 |
| `/api/words` | GET/POST/PUT | ワード取得/追加/一括追加 |
| `/api/words/[id]` | PUT/DELETE | ワード更新/削除 |
| `/api/words/bulk-delete` | POST | ワード一括削除 |
| `/api/categories` | GET/POST | カテゴリ取得/追加 |
| `/api/categories/[id]` | PUT/DELETE | カテゴリ更新/削除 |
