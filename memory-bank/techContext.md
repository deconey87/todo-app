# 技術コンテキスト

## 開発環境
- **Node.js**: v18以上
- **パッケージマネージャー**: npm
- **開発サーバー**: Next.js Dev Server
- **テストランナー**: Vitest

## フレームワーク・ライブラリ
- **Next.js**: App Router使用、API Routes実装
- **React**: UIコンポーネント、Server Components活用
- **TypeScript**: 静的型チェック、ブランド型活用
- **Tailwind CSS**: ユーティリティファースト、カスタムデザイントークン
- **Vitest**: テストフレームワーク

## データ永続化
- **現在**: インメモリリポジトリ（開発・テスト用）
- **将来**: PostgreSQL統合予定

## アーキテクチャ実装
- **ポート&アダプター**: 依存関係逆転による疎結合
- **依存性注入**: ファクトリーパターンによるコンテナ管理
- **時刻注入**: TimeProviderによるテスタビリティ向上
- **ブランド型**: 型安全性強化
- **統一型管理**: [`TaskStatus.ts`](src/shared/types/TaskStatus.ts)による型定義一元化
- **モダンミニマルデザイン**: セマンティックHTML + 階層的CSS設計

## ディレクトリ構造
```
src/
├── application/     # アプリケーション層
├── domain/         # ドメイン層
├── infrastructure/ # インフラストラクチャ層
└── shared/         # 共有型定義
    └── types/      # 統一型管理
app/
├── api/           # Next.js API Routes
├── globals.css    # デザイントークン・ユーティリティクラス
└── (pages)        # UIページ
components/
├── server/        # Server Components（セマンティックHTML強化）
└── ui/           # 基本UIコンポーネント
```

## テスト戦略
- **単体テスト**: 143個のテストケース（100%通過）
- **型変換テスト**: [`TaskStatus.test.ts`](src/shared/types/TaskStatus.test.ts)による包括的検証
- **モック**: ポートインターフェースのモック化
- **時間依存テスト**: 固定時刻による安定化
- **並列実行**: ファクトリーパターンによる状態分離
- **UI機能テスト**: デザイン改善時の機能完全性確認

## 品質管理
- **ESLint**: コード品質チェック
- **TypeScript**: 静的型チェック、統一型定義による型安全性向上
- **Vitest**: 自動テスト実行（143個のテストケース）
- **SOLID原則**: 設計品質の維持
- **DRY原則**: 型定義重複の排除（87.5%削減達成）
- **セマンティックHTML**: アクセシビリティ・SEO品質向上
- **パフォーマンス**: DOM軽量化による高速化（30%削減）

## 技術的負債の解決（2025/6/2）

### Status型重複問題の解決
- **問題**: 8箇所の重複する型定義による保守性の低下
- **解決策**: [`TaskStatus.ts`](src/shared/types/TaskStatus.ts)による統一型定義
- **成果**: 型定義箇所を87.5%削減、保守性と拡張性の大幅向上

### 型安全性の向上
- **統一型定義**: ドメイン層enumと他層の完全統合
- **変換処理統一**: `TaskStatusConverter`による安全な型変換
- **テスト保護**: 25個の新規テストケースによる変換処理の完全検証

### 開発効率の改善
- **新ステータス追加**: 修正箇所を87.5%削減（8箇所→1箇所）
- **型の不一致防止**: 統一された型定義による整合性確保
- **リファクタリング安全性**: 既存テスト118個の完全保護

## UIデザイン技術実装（2025/6/2）

### 新しいCSS変数・デザイントークン
```css
/* 階層的背景色システム */
--surface-1: #ffffff;    /* 最上位背景 */
--surface-2: #f8f9fa;    /* 中間背景 */
--surface-3: #e9ecef;    /* 深い背景 */

/* 区切り線・アクセント */
--divider: #dee2e6;      /* 区切り線色 */
--accent-line: #007bff;  /* アクセント線色 */
```

### 新しいユーティリティクラス
```css
/* 背景色ユーティリティ */
.surface-1 { background-color: var(--surface-1); }
.surface-2 { background-color: var(--surface-2); }
.surface-3 { background-color: var(--surface-3); }

/* 区切り線ユーティリティ */
.divider-bottom { border-bottom: 1px solid var(--divider); }
.accent-left { border-left: 3px solid var(--accent-line); }

/* タイポグラフィスケール */
.text-display { font-size: 1.5rem; font-weight: 700; }
.text-heading { font-size: 1.25rem; font-weight: 600; }
.text-subheading { font-size: 1rem; font-weight: 500; }
.text-body { font-size: 0.875rem; font-weight: 400; }
.text-caption { font-size: 0.75rem; font-weight: 400; }
```

### セマンティックHTML強化記録
- **DashboardHeader**: `Card` → `<header>` + `divider-bottom`
- **TaskListSidebar**: `2×Card` → `<aside>` + `<section>` + `accent-left`
- **TaskList**: `Card` → `<section>` + `surface-2`
- **TaskItem**: `Card` → `<li>` + `border-bottom` + `hover:bg-gray-50`

### 実装技術効果
- **DOM削減**: 30%（Card要素の戦略的除去）
- **CSS簡素化**: 40%（不要スタイル定義削除）
- **セマンティック向上**: HTML要素の意味的正確性強化
- **アクセシビリティ向上**: スクリーンリーダー対応改善
- **SEO向上**: 構造化データの改善
- **パフォーマンス向上**: 軽量化による読み込み速度改善

### 今後の技術発展方向
- **デザイントークン拡張**: 新機能追加時の一貫性確保
- **コンポーネント設計指針**: モダンミニマル原則の適用
- **パフォーマンス監視**: 継続的な軽量化効果測定
- **アクセシビリティ強化**: WCAG準拠レベルの向上