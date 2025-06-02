/**
 * タスクステータスの共通型定義
 * 
 * このファイルは全層で使用されるタスクステータス関連の型と
 * ユーティリティ関数を提供します。
 * 
 * DDD原則に従い、ドメイン層のTaskStatusEnumとの互換性を保ちながら、
 * アプリケーション層以上では文字列リテラル型を使用します。
 */

import { InvalidTaskStatusError } from '../../application/errors/ApplicationError';

// 基本的なステータス値の定義（const assertion）
export const TASK_STATUS_VALUES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

// 文字列リテラル型（アプリケーション層以上で使用）
export type TaskStatusLiteral = typeof TASK_STATUS_VALUES[number];

// ステータスラベルの定義（UI表示用）
export const TASK_STATUS_LABELS = {
  TODO: '未着手',
  IN_PROGRESS: '進行中',
  DONE: '完了'
} as const;

// ドメイン層との互換性のためのEnum定義
export enum TaskStatusEnum {
  TODO = '未着手',
  IN_PROGRESS = '進行中',
  DONE = '完了'
}

/**
 * 値がTaskStatusLiteralかどうかを判定する型ガード関数
 * @param value 判定対象の値
 * @returns TaskStatusLiteralの場合true
 */
export function isValidTaskStatus(value: unknown): value is TaskStatusLiteral {
  return typeof value === 'string' && 
         TASK_STATUS_VALUES.includes(value as TaskStatusLiteral);
}

/**
 * 値がTaskStatusLiteralであることを保証し、そうでなければエラーを投げる
 * @param value 検証対象の値
 * @returns 検証済みのTaskStatusLiteral
 * @throws InvalidTaskStatusError 無効なステータスの場合
 */
export function assertTaskStatus(value: unknown): TaskStatusLiteral {
  if (!isValidTaskStatus(value)) {
    throw new InvalidTaskStatusError(`Invalid status: ${value}`);
  }
  return value;
}

/**
 * TaskStatusの変換処理を担当するユーティリティクラス
 * ドメイン層のEnumとアプリケーション層の文字列リテラル間の変換を提供
 */
export class TaskStatusConverter {
  /**
   * TaskStatusLiteralをTaskStatusEnumに変換
   * @param literal 文字列リテラル
   * @returns 対応するTaskStatusEnum
   */
  static toEnum(literal: TaskStatusLiteral): TaskStatusEnum {
    return TaskStatusEnum[literal];
  }
  
  /**
   * TaskStatusEnumをTaskStatusLiteralに変換
   * @param enumValue TaskStatusEnum値
   * @returns 対応するTaskStatusLiteral
   */
  static toLiteral(enumValue: TaskStatusEnum): TaskStatusLiteral {
    // TaskStatusEnumの値（日本語）からキー（英語）を逆引き
    switch (enumValue) {
      case TaskStatusEnum.TODO:
        return 'TODO';
      case TaskStatusEnum.IN_PROGRESS:
        return 'IN_PROGRESS';
      case TaskStatusEnum.DONE:
        return 'DONE';
      default:
        throw new InvalidTaskStatusError(`Cannot convert enum value: ${enumValue}`);
    }
  }
  
  /**
   * TaskStatusLiteralに対応する日本語ラベルを取得
   * @param status ステータス
   * @returns 日本語ラベル
   */
  static getLabel(status: TaskStatusLiteral): string {
    return TASK_STATUS_LABELS[status];
  }
  
  /**
   * 全ステータス値を取得
   * @returns 全ステータス値の配列
   */
  static getAllValues(): readonly TaskStatusLiteral[] {
    return TASK_STATUS_VALUES;
  }
  
  /**
   * ステータスの網羅性チェック用のヘルパー関数
   * switch文で全ケースを処理していることを保証
   * @param status 処理対象のステータス
   * @returns never（到達不可能）
   */
  static assertNever(status: never): never {
    throw new Error(`Unhandled status: ${status}`);
  }
}

/**
 * ステータス処理のサンプル実装（網羅性チェック付き）
 * 新しいステータスが追加された際、TypeScriptがコンパイル時にエラーを出力
 */
export function handleTaskStatus(status: TaskStatusLiteral): string {
  switch (status) {
    case 'TODO':
    case 'IN_PROGRESS':
    case 'DONE':
      return TaskStatusConverter.getLabel(status);
    default:
      // TypeScriptが未処理ケースを検出
      return TaskStatusConverter.assertNever(status);
  }
}