import { TimeProvider } from '../../../../application/ports/output/TimeProvider';

/**
 * システム時刻を提供するTimeProviderの実装
 * 本番環境では実際のシステム時刻を返す
 */
export class SystemTimeProvider implements TimeProvider {
  /**
   * 現在のシステム時刻を取得
   * @returns 現在時刻のDateオブジェクト
   */
  now(): Date {
    return new Date();
  }
}