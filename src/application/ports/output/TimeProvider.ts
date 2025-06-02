/**
 * 時刻提供のためのポートインターフェース
 * テスタビリティ向上のため、時刻取得を抽象化
 */
export interface TimeProvider {
  /**
   * 現在時刻を取得
   * @returns 現在時刻のDateオブジェクト
   */
  now(): Date;
}