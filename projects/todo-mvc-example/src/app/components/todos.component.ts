import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TodosActor } from '../actors/todos.actor';

import { NewTodoComponent } from './new-todo.component';
import { TodoListComponent } from './todo-list.component';
import { TodosFooterComponent } from './todos-footer.component';
import { ToggleAllComponent } from './toggle-all.component';

@Component({
  standalone: true,
  selector: 'app-todos',
  imports: [
    CommonModule,
    NewTodoComponent,
    TodoListComponent,
    TodosFooterComponent,
    ToggleAllComponent,
    RouterModule,
  ],
  template: `
    <section class="todoapp">
      <app-new-todo />
      <section *ngIf="totalTodos() > 0" class="main">
        <app-toggle-all />
        <app-todo-list />
        <app-todos-footer />
      </section>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodosComponent {
  private actor = inject(TodosActor);

  public readonly totalTodos = this.actor.selectSignal(
    state => state.context.todoRefs.length
  );
}
