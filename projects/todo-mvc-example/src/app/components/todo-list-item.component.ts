import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  Input,
  runInInjectionContext,
  Signal,
} from '@angular/core';

import {
  objectShallowEqual,
  useSelector,
  useSignalSelector,
} from '@pxtrn/ngxstate';
import { Observable } from 'rxjs';
import { ActorRefFrom } from 'xstate';

import { TodoMachine } from '../actors/todo.machine';
import { Todo } from '../models';

@Component({
  selector: 'app-todo-list-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <li
      [ngClass]="{
        completed: todo().completed,
        editing: editing()
      }"
    >
      <div class="view">
        <input
          class="toggle"
          type="checkbox"
          (click)="onToggle()"
          [checked]="todo().completed"
        />
        <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
        <label (dblclick)="onEdit()">{{ todo().title }}</label>
        <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
        <button class="destroy" (click)="onRemove()"></button>
      </div>
      <input
        class="edit"
        #title
        *ngIf="editing()"
        [value]="newTitle$ | async"
        (input)="onInput(title.value)"
        (blur)="onComplete()"
        (keyup.enter)="onComplete()"
        (keyup.escape)="onCancel()"
      />
    </li>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListItemComponent {
  private _actorRef!: ActorRefFrom<TodoMachine>;

  public newTitle$?: Observable<string>;

  public todo!: Signal<Todo>;

  public editing!: Signal<boolean>;

  private injector = inject(Injector);

  @Input({ required: true })
  set actorRef(actorRef: ActorRefFrom<TodoMachine>) {
    if (Object.is(this._actorRef, actorRef)) return;

    this._actorRef = actorRef;

    this.newTitle$ = useSelector(actorRef, state => state.context.newTitle);

    runInInjectionContext(this.injector, () => {
      this.todo = useSignalSelector(
        actorRef,
        state => ({ ...state.context.todo }),
        objectShallowEqual
      );

      this.editing = useSignalSelector(actorRef, state =>
        state.matches('editing')
      );
    });
  }

  onToggle() {
    this._actorRef.send({ type: 'todo.toggle' });
  }

  onRemove() {
    this._actorRef.send({ type: 'todo.remove' });
  }

  onEdit() {
    this._actorRef.send({ type: 'edit.start' });
  }

  onComplete() {
    this._actorRef.send({ type: 'edit.complete' });
  }

  onCancel() {
    this._actorRef.send({ type: 'edit.cancel' });
  }

  onInput(title: string) {
    this._actorRef.send({ type: 'edit.change', title });
  }
}
