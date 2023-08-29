import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';

import { TodosActor } from '../actors/todos.actor';

@Component({
  selector: 'app-new-todo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        #title
        (blur)="onCreate()"
        (keyup.enter)="onCreate()"
        placeholder="What needs to be done?"
      />
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewTodoComponent {
  private todosActor = inject(TodosActor);

  @ViewChild('title')
  private title!: ElementRef;

  public onCreate() {
    this.todosActor.send({
      type: 'todo.new',
      title: this.title.nativeElement.value,
    });
    this.title.nativeElement.value = '';
  }
}
