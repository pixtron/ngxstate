import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TodosActor } from '../actors/todos.actor';

@Component({
  selector: 'app-toggle-all',
  standalone: true,
  template: `
    <input
      id="toggle-all"
      #toggleAll
      [checked]="allCompleted()"
      (change)="onSetCompleted(toggleAll.checked)"
      class="toggle-all"
      type="checkbox"
    />
    <label for="toggle-all">
      Mark all as {{ allCompleted() ? 'active' : 'complete' }}
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleAllComponent {
  private actor = inject(TodosActor);

  public readonly allCompleted = this.actor.selectSignal(
    ({ context: { todoRefs } }) => {
      return !todoRefs.some(ref => !ref.getSnapshot()!.context.todo.completed);
    }
  );

  public onSetCompleted(completed: boolean) {
    this.actor.send({ type: 'todos.setCompleted', completed });
  }
}
