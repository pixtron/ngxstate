import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { AbstractActor, useActor } from 'ngxstate';
import { filter, map } from 'rxjs';

import { Filter } from '../models';
import { TodoStorageService } from '../services/todo-storage.service';

import { TodosMachine, todosMachine } from './todos.machine';

function isFilter(subj: string): subj is Filter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.values(Filter).includes(subj as any);
}

@Injectable({
  providedIn: 'root',
})
export class TodosActor extends AbstractActor<TodosMachine> {
  private readonly router = inject(Router);

  private readonly storageService = inject(TodoStorageService);

  public readonly actor = useActor(todosMachine, {
    implementation: {
      services: {
        filter: () =>
          this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(event => (event as NavigationEnd).urlAfterRedirects.slice(1)),
            filter(isFilter),
            map(filter => ({ type: 'filter.change', filter }))
          ),
        loadTodos: async () => this.storageService.getTodos(),
        update: async (_, event) => {
          switch (event.type) {
            case 'todo.delete':
              return this.storageService.deleteTodo(event.id);
            case 'todo.patch':
              return this.storageService.patchTodo(event.id, event.patch);
            case 'todos.delete':
              return this.storageService.deleteTodos(event.ids);
          }
        },
        insert: async (_, event) => this.storageService.createTodo(event.title),
      },
    },
  });
}
