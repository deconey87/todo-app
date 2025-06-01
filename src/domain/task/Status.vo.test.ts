import { Status, TaskStatusEnum } from './Status.vo';

describe('Status Value Object', () => {
  describe('constructor', () => {
    it('should create a Status instance with a valid TaskStatusEnum value', () => {
      const statusTodo = new Status(TaskStatusEnum.TODO);
      expect(statusTodo.value).toBe(TaskStatusEnum.TODO);

      const statusInProgress = new Status(TaskStatusEnum.IN_PROGRESS);
      expect(statusInProgress.value).toBe(TaskStatusEnum.IN_PROGRESS);

      const statusDone = new Status(TaskStatusEnum.DONE);
      expect(statusDone.value).toBe(TaskStatusEnum.DONE);
    });

    it('should throw an error if value is an invalid TaskStatusEnum', () => {
      // @ts-expect-error: Testing invalid input
      expect(() => new Status('INVALID_STATUS')).toThrow('Invalid TaskStatus: INVALID_STATUS');
      // @ts-expect-error: Testing invalid input
      expect(() => new Status(null)).toThrow('Invalid TaskStatus: null');
      // @ts-expect-error: Testing invalid input
      expect(() => new Status(undefined)).toThrow('Invalid TaskStatus: undefined');
    });
  });

  describe('equals', () => {
    it('should return true if two Status instances have the same value', () => {
      const status1 = new Status(TaskStatusEnum.TODO);
      const status2 = new Status(TaskStatusEnum.TODO);
      expect(status1.equals(status2)).toBe(true);
    });

    it('should return false if two Status instances have different values', () => {
      const status1 = new Status(TaskStatusEnum.TODO);
      const status2 = new Status(TaskStatusEnum.IN_PROGRESS);
      expect(status1.equals(status2)).toBe(false);
    });
  });
});