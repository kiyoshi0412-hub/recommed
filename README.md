# Driver Appeal Manager

ドライバー人材紹介向け企業訴求ポイント管理ツール

## 概要

キャリアアドバイザー（CA）が求職者への面談・提案時に活用する、企業訴求ポイントの管理・閲覧Webアプリです。

## 機能

- **CA閲覧画面**: 企業訴求ポイントをカテゴリ別に確認・コピー
- **管理画面**: 企業情報・訴求ポイントのCRUD管理
- **PDF生成**: 企業訴求ポイントをPDF出力
- **LINE文案生成**: Claude APIを使ったLINEメッセージ文案の自動生成

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Next.js API Routes
- **DB**: SQLite（開発）/ PostgreSQL（本番）
- **ORM**: Prisma
- **PDF生成**: @react-pdf/renderer

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env を編集して DATABASE_URL を設定

# DBマイグレーション
npx prisma migrate dev --name init

# 開発サーバー起動
npm run dev
```

## 起動確認

ブラウザで http://localhost:3000 を開く

- CA閲覧画面: http://localhost:3000/companies
- 管理画面: http://localhost:3000/admin

## ディレクトリ構成

```
driver-appeal-manager/
├── app/
│   ├── companies/      # CA向け企業訴求ポイント閲覧
│   ├── admin/          # 管理者向け企業・訴求ポイント登録
│   ├── api/            # APIルート
│   └── layout.tsx
├── components/         # 共通コンポーネント
├── lib/
│   └── prisma.ts       # Prismaクライアント
├── prisma/
│   └── schema.prisma   # DBスキーマ定義
├── .env.example
└── README.md
```
