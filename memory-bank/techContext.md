# 技術コンテキスト

## 技術スタック
- **Next.js**: App Router、API Routes、Server Components
- **React**: UIコンポーネント
- **TypeScript**: 静的型チェック、ブランド型、統一型管理
- **Tailwind CSS**: ユーティリティファースト、カスタムデザイントークン
- **Vitest**: テストフレームワーク（143個テストケース、100%通過）

## アーキテクチャ実装
- **ポート&アダプター**: 依存関係逆転による疎結合
- **依存性注入**: ファクトリーパターンによるコンテナ管理
- **時刻注入**: TimeProviderによるテスタビリティ向上
- **統一型管理**: [`TaskStatus.ts`](src/shared/types/TaskStatus.ts)による型定義一元化（87.5%削減）
- **モダンミニマルデザイン**: セマンティックHTML + 階層的CSS設計

## ディレクトリ構造
```
src/
├── application/     # アプリケーション層
├── domain/         # ドメイン層  
├── infrastructure/ # インフラストラクチャ層
└── shared/types/   # 統一型管理
app/
├── api/           # Next.js API Routes
├── globals.css    # デザイントークン
└── (pages)        # UIページ
components/
├── server/        # Server Components（セマンティックHTML）
└── ui/           # 基本UIコンポーネント
```

## データ永続化
- **現在**: インメモリリポジトリ（開発・テスト用）
- **将来**: PostgreSQL統合予定

## 品質管理（バックエンド層 - 高品質）
- **テスト**: 143個（100%通過）、型変換テスト、モック化、時間依存テスト
- **型安全性**: 統一型定義による大幅向上（87.5%削減）
- **コード品質**: ESLint、TypeScript、SOLID原則、DRY原則
- **アーキテクチャ**: DDD原則完全準拠

## UI統合の技術的課題（緊急対応必要）
- **Server Actions**: 実装済みだが対応するUIが未統合
- **メインページ**: [`app/page.tsx`](app/page.tsx)がNext.jsサンプルのまま
- **CRUD操作UI**: 作成・編集・削除機能のUI実装が不完全

## 技術的負債解決（完了済み - 2025/6/2）
### Status型重複問題解決
- 8箇所の重複定義→1箇所に統一（87.5%削減）
- [`TaskStatusConverter`](src/shared/types/TaskStatus.ts)による安全な型変換
- 25個の新規テストケースによる保護

## 確立されたUIデザイン技術（活用すべきパターン）
### デザイントークン
```css
/* 階層的背景色 */
--surface-1/2/3: 視覚的深度表現
--divider: 区切り線色
--accent-line: アクセント線色

/* タイポグラフィスケール */
.text-display/heading/subheading/body/caption
```

### セマンティックHTML強化
- DashboardHeader: `<header>`
- TaskListSidebar: `<aside>` + `<section>`
- TaskList: `<section>`
- TaskItem: `<li>`

## 次の技術実装ステップ
### 短期（緊急対応）
- メインページ実装（ユーザーエントリーポイント）
- 既存Server Actionsとの統合（タスク・タスクリスト作成）
- CRUD操作UI完全実装

### 中期
- エラーハンドリング強化、ユーザビリティ向上
- 確立されたデザインパターンの全面適用

### 長期
- PostgreSQL統合、プロダクション対応
- パフォーマンス監視、アクセシビリティ強化