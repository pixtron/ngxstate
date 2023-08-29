import { Injectable } from '@angular/core';

import { Todo, TodoStorage } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TodoStorageService implements TodoStorage {
  private _todoIds: Set<string>;

  constructor() {
    this._todoIds = new Set<string>(
      JSON.parse(localStorage.getItem('todoIds') || '[]')
    );
  }

  async getTodos(): Promise<Todo[]> {
    const todos = [...this._todoIds]
      .map(id => this.getTodoFromLocalStorage(id))
      .filter(todo => todo !== null);

    return todos as Todo[];
  }

  async createTodo(title: string): Promise<Todo> {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
    };

    this._todoIds.add(newTodo.id);
    this.setTodoInLocalStorage(newTodo);
    this.setTodoIdsInLocalStorage();

    return newTodo;
  }

  async patchTodo(id: string, patch: Partial<Omit<Todo, 'id'>>): Promise<void> {
    const todo = this.getTodoFromLocalStorage(id);
    if (!todo) throw new Error(`Todo with id ${id} does not exist in storage`);

    const patchedTodo = {
      ...todo,
      ...patch,
    };

    this.setTodoInLocalStorage(patchedTodo);
  }

  async deleteTodo(id: string): Promise<void> {
    this._todoIds.delete(id);
    localStorage.removeItem(`todo-${id}`);

    this.setTodoIdsInLocalStorage();
  }

  async deleteTodos(ids: string[]): Promise<void> {
    for (const id of ids) {
      this._todoIds.delete(id);
      localStorage.removeItem(`todo-${id}`);
    }

    this.setTodoIdsInLocalStorage();
  }

  private getTodoFromLocalStorage(id: string): Todo | null {
    return JSON.parse(localStorage.getItem(`todo-${id}`) || 'null');
  }

  private setTodoInLocalStorage(todo: Todo) {
    localStorage.setItem(`todo-${todo.id}`, JSON.stringify(todo));
  }

  private setTodoIdsInLocalStorage() {
    localStorage.setItem(`todoIds`, JSON.stringify([...this._todoIds]));
  }
}
