import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CounterActor } from './counter.actor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>
      Count observable: {{ count$ | async }}<br />
      Count signal: {{ count() }}
    </h1>
    <button (click)="decrement()">-</button>
    <button (click)="increment()">+</button>
    <button (click)="reset()">Reset</button>
  `,
})
export class AppComponent {
  private counterActor = inject(CounterActor);

  public count$ = this.counterActor.select(state => state.context.count);

  public count = this.counterActor.selectSignal(state => state.context.count);

  public increment() {
    this.counterActor.send({ type: 'INCREMENT' });
  }

  public decrement() {
    this.counterActor.send({ type: 'DECREMENT' });
  }

  public reset() {
    this.counterActor.send({ type: 'RESET' });
  }
}
