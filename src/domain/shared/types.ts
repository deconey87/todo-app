export type TaskId = string & { readonly __brand: 'TaskId' };
export type ListId = string & { readonly __brand: 'ListId' };

export const TaskId = {
  create: (value: string): TaskId => value as TaskId,
  isValid: (value: string): value is TaskId => typeof value === 'string' && value.length > 0
};

export const ListId = {
  create: (value: string): ListId => value as ListId,
  isValid: (value: string): value is ListId => typeof value === 'string' && value.length > 0
};