import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { TodosActor } from '../actors/todos.actor';
import { Filter } from '../models';

@Component({
  selector: 'app-todos-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <footer class="footer">
      <span class="todo-count">
        {{ todosLeftCount() }}
        {{ todosLeftCount() === 1 ? 'item' : 'items' }} left
      </span>
      <ul class="filters">
        <li *ngFor="let filter of filters">
          <a [routerLink]="['/', filter]" routerLinkActive="selected">{{
            filter[0].toUpperCase() + filter.slice(1)
          }}</a>
        </li>
      </ul>
      <button
        *ngIf="todosLeftCount() < totalTodos()"
        class="clear-completed"
        (click)="onClearCompleted()"
      >
        Clear completed
      </button>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodosFooterComponent {
  private actor = inject(TodosActor);

  public filters = Object.values(Filter);

  public readonly totalTodos = this.actor.selectSignal(
    state => state.context.todoRefs.length
  );

  public readonly todosLeftCount = this.actor.selectSignal(
    ({ context: { todoRefs } }) =>
      todoRefs.filter(ref => !ref.getSnapshot()?.context.todo.completed).length
  );

  public onClearCompleted() {
    this.actor.send({ type: 'todos.clearCompleted' });
  }
}
