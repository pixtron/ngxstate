export type Todo = {
  id: string;
  completed: boolean;
  title: string;
};

export enum Filter {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export interface TodoStorage {
  getTodos(): Promise<Todo[]>;

  createTodo(title: string): Promise<Todo>;

  patchTodo(id: string, patch: Partial<Omit<Todo, 'id'>>): Promise<void>;

  deleteTodo(id: string): Promise<void>;

  deleteTodos(ids: string[]): Promise<void>;
}
