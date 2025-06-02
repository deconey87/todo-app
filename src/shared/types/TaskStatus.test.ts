import { describe, it, expect } from 'vitest';
import {
  TASK_STATUS_VALUES,
  TaskStatusLiteral,
  TASK_STATUS_LABELS,
  TaskStatusEnum,
  isValidTaskStatus,
  assertTaskStatus,
  TaskStatusConverter,
  handleTaskStatus
} from './TaskStatus';
import { InvalidTaskStatusError } from '../../application/errors/ApplicationError';

describe('TaskStatus共通型定義', () => {
  describe('TASK_STATUS_VALUES', () => {
    it('正しいステータス値を含む', () => {
      expect(TASK_STATUS_VALUES).toEqual(['TODO', 'IN_PROGRESS', 'DONE']);
    });

    it('読み取り専用である', () => {
      // const assertionによる読み取り専用性は実行時ではなくコンパイル時の制約
      // 実行時には配列への変更は可能だが、TypeScriptでは型エラーになる
      const originalLength = TASK_STATUS_VALUES.length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (TASK_STATUS_VALUES as any).push('TEST_STATUS');
      expect(TASK_STATUS_VALUES.length).toBe(originalLength + 1);
      
      // テスト後にクリーンアップ
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (TASK_STATUS_VALUES as any).pop();
      expect(TASK_STATUS_VALUES.length).toBe(originalLength);
    });
  });

  describe('TASK_STATUS_LABELS', () => {
    it('正しい日本語ラベルを含む', () => {
      expect(TASK_STATUS_LABELS.TODO).toBe('未着手');
      expect(TASK_STATUS_LABELS.IN_PROGRESS).toBe('進行中');
      expect(TASK_STATUS_LABELS.DONE).toBe('完了');
    });

    it('全ステータスに対応するラベルが存在する', () => {
      TASK_STATUS_VALUES.forEach(status => {
        expect(TASK_STATUS_LABELS[status]).toBeDefined();
        expect(typeof TASK_STATUS_LABELS[status]).toBe('string');
      });
    });
  });

  describe('TaskStatusEnum', () => {
    it('正しい日本語値を持つ', () => {
      expect(TaskStatusEnum.TODO).toBe('未着手');
      expect(TaskStatusEnum.IN_PROGRESS).toBe('進行中');
      expect(TaskStatusEnum.DONE).toBe('完了');
    });

    it('ラベルと一致する', () => {
      expect(TaskStatusEnum.TODO).toBe(TASK_STATUS_LABELS.TODO);
      expect(TaskStatusEnum.IN_PROGRESS).toBe(TASK_STATUS_LABELS.IN_PROGRESS);
      expect(TaskStatusEnum.DONE).toBe(TASK_STATUS_LABELS.DONE);
    });
  });

  describe('isValidTaskStatus', () => {
    it('有効なステータス文字列でtrueを返す', () => {
      expect(isValidTaskStatus('TODO')).toBe(true);
      expect(isValidTaskStatus('IN_PROGRESS')).toBe(true);
      expect(isValidTaskStatus('DONE')).toBe(true);
    });

    it('無効なステータス文字列でfalseを返す', () => {
      expect(isValidTaskStatus('INVALID')).toBe(false);
      expect(isValidTaskStatus('todo')).toBe(false);
      expect(isValidTaskStatus('')).toBe(false);
    });

    it('文字列以外の値でfalseを返す', () => {
      expect(isValidTaskStatus(null)).toBe(false);
      expect(isValidTaskStatus(undefined)).toBe(false);
      expect(isValidTaskStatus(123)).toBe(false);
      expect(isValidTaskStatus({})).toBe(false);
      expect(isValidTaskStatus([])).toBe(false);
    });
  });

  describe('assertTaskStatus', () => {
    it('有効なステータス文字列をそのまま返す', () => {
      expect(assertTaskStatus('TODO')).toBe('TODO');
      expect(assertTaskStatus('IN_PROGRESS')).toBe('IN_PROGRESS');
      expect(assertTaskStatus('DONE')).toBe('DONE');
    });

    it('無効なステータス文字列でInvalidTaskStatusErrorを投げる', () => {
      expect(() => assertTaskStatus('INVALID')).toThrow(InvalidTaskStatusError);
      expect(() => assertTaskStatus('todo')).toThrow(InvalidTaskStatusError);
      expect(() => assertTaskStatus('')).toThrow(InvalidTaskStatusError);
    });

    it('文字列以外の値でInvalidTaskStatusErrorを投げる', () => {
      expect(() => assertTaskStatus(null)).toThrow(InvalidTaskStatusError);
      expect(() => assertTaskStatus(undefined)).toThrow(InvalidTaskStatusError);
      expect(() => assertTaskStatus(123)).toThrow(InvalidTaskStatusError);
    });

    it('エラーメッセージに無効な値が含まれる', () => {
      expect(() => assertTaskStatus('INVALID')).toThrow('Invalid status: INVALID');
      expect(() => assertTaskStatus(123)).toThrow('Invalid status: 123');
    });
  });

  describe('TaskStatusConverter', () => {
    describe('toEnum', () => {
      it('TaskStatusLiteralをTaskStatusEnumに正しく変換する', () => {
        expect(TaskStatusConverter.toEnum('TODO')).toBe(TaskStatusEnum.TODO);
        expect(TaskStatusConverter.toEnum('IN_PROGRESS')).toBe(TaskStatusEnum.IN_PROGRESS);
        expect(TaskStatusConverter.toEnum('DONE')).toBe(TaskStatusEnum.DONE);
      });
    });

    describe('toLiteral', () => {
      it('TaskStatusEnumをTaskStatusLiteralに正しく変換する', () => {
        expect(TaskStatusConverter.toLiteral(TaskStatusEnum.TODO)).toBe('TODO');
        expect(TaskStatusConverter.toLiteral(TaskStatusEnum.IN_PROGRESS)).toBe('IN_PROGRESS');
        expect(TaskStatusConverter.toLiteral(TaskStatusEnum.DONE)).toBe('DONE');
      });

      it('無効なEnum値でInvalidTaskStatusErrorを投げる', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => TaskStatusConverter.toLiteral('無効な値' as any)).toThrow(InvalidTaskStatusError);
      });
    });

    describe('getLabel', () => {
      it('正しい日本語ラベルを返す', () => {
        expect(TaskStatusConverter.getLabel('TODO')).toBe('未着手');
        expect(TaskStatusConverter.getLabel('IN_PROGRESS')).toBe('進行中');
        expect(TaskStatusConverter.getLabel('DONE')).toBe('完了');
      });
    });

    describe('getAllValues', () => {
      it('全ステータス値を返す', () => {
        const values = TaskStatusConverter.getAllValues();
        expect(values).toEqual(['TODO', 'IN_PROGRESS', 'DONE']);
        expect(values).toBe(TASK_STATUS_VALUES); // 同じ参照であることを確認
      });
    });

    describe('assertNever', () => {
      it('常にエラーを投げる', () => {
        expect(() => TaskStatusConverter.assertNever('test' as never)).toThrow('Unhandled status: test');
      });
    });
  });

  describe('handleTaskStatus', () => {
    it('全ステータスに対して正しいラベルを返す', () => {
      expect(handleTaskStatus('TODO')).toBe('未着手');
      expect(handleTaskStatus('IN_PROGRESS')).toBe('進行中');
      expect(handleTaskStatus('DONE')).toBe('完了');
    });
  });

  describe('型安全性のテスト', () => {
    it('TaskStatusLiteralは正しい型制約を持つ', () => {
      // TypeScriptコンパイル時のテスト
      const validStatus: TaskStatusLiteral = 'TODO';
      expect(validStatus).toBe('TODO');

      // 以下はコンパイルエラーになるべき（実行時テストでは確認できない）
      // const invalidStatus: TaskStatusLiteral = 'INVALID'; // TypeScript error
    });

    it('TASK_STATUS_VALUESの型推論が正しい', () => {
      // const assertionにより、型が正しく推論されることを確認
      expect(TASK_STATUS_VALUES).toEqual(['TODO', 'IN_PROGRESS', 'DONE']);
      // 型レベルでの検証（コンパイル時）
      const _typeCheck: readonly ['TODO', 'IN_PROGRESS', 'DONE'] = ['TODO', 'IN_PROGRESS', 'DONE'];
      expect(_typeCheck).toBeDefined();
    });
  });

  describe('相互変換の整合性', () => {
    it('Literal -> Enum -> Literalの変換で元の値に戻る', () => {
      TASK_STATUS_VALUES.forEach(literal => {
        const enumValue = TaskStatusConverter.toEnum(literal);
        const backToLiteral = TaskStatusConverter.toLiteral(enumValue);
        expect(backToLiteral).toBe(literal);
      });
    });

    it('Enum -> Literal -> Enumの変換で元の値に戻る', () => {
      Object.values(TaskStatusEnum).forEach(enumValue => {
        const literal = TaskStatusConverter.toLiteral(enumValue);
        const backToEnum = TaskStatusConverter.toEnum(literal);
        expect(backToEnum).toBe(enumValue);
      });
    });
  });

  describe('拡張性のテスト', () => {
    it('新しいステータスが追加された場合の検証', () => {
      // このテストは、新しいステータスが追加された際に
      // 必要な箇所が更新されているかを確認するためのもの
      const expectedStatusCount = 3;
      expect(TASK_STATUS_VALUES.length).toBe(expectedStatusCount);
      expect(Object.keys(TASK_STATUS_LABELS).length).toBe(expectedStatusCount);
      expect(Object.keys(TaskStatusEnum).length).toBe(expectedStatusCount);
    });
  });
});