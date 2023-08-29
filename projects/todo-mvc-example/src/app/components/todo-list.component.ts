import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { arrayShallowEqual } from 'ngxstate';
import { distinctUntilChanged, map } from 'rxjs';

import { TodosActor } from '../actors/todos.actor';
import { Filter } from '../models';

import { TodoListItemComponent } from './todo-list-item.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoListItemComponent],
  template: `
    <ul class="todo-list" *ngIf="visibleTodoRefs$ | async as visibleTodoRefs">
      <app-todo-list-item
        *ngFor="let ref of visibleTodoRefs"
        [actorRef]="ref"
      />
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent {
  private readonly actor = inject(TodosActor);

  public readonly visibleTodoRefs$ = this.actor.pipe(
    map(state => {
      const { filter, todoRefs } = state.context;
      if (filter === Filter.ALL) return todoRefs;

      return todoRefs.filter(ref => {
        switch (filter) {
          case Filter.ACTIVE:
            return !ref.getSnapshot()?.context.todo.completed;
          case Filter.COMPLETED:
            return ref.getSnapshot()?.context.todo.completed;
          default:
            // eslint-disable-next-line no-case-declarations
            const exhaustiveCheck: never = filter;
            throw new Error(`invalid filter value: ${exhaustiveCheck}`);
        }
      });
    }),
    distinctUntilChanged(arrayShallowEqual)
  );
}
