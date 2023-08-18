import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { createSelector, select } from '@ngrx/store';

import { CounterActor } from './counter.actor';
import { counterEvents, CounterState } from './counter.machine';

const selectContext = (state: CounterState) => state.context;
const selectCount = createSelector(selectContext, context => context.count);
const selectDoubleCount = createSelector(selectCount, count => count * 2);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>
      Count observable: {{ count$ | async }}<br />
      Count signal * 2: {{ count() }} <br />
      Piped count: {{ pipedCount$ | async }}
    </h1>
    <button (click)="decrement()">-</button>
    <button (click)="increment()">+</button>
    <button (click)="reset()">Reset</button>
  `,
})
export class AppComponent {
  private counterActor = inject(CounterActor);

  public count$ = this.counterActor.select(selectCount);

  public count = this.counterActor.selectSignal(selectDoubleCount);

  public pipedCount$ = this.counterActor.pipe(select(selectCount));

  public increment() {
    this.counterActor.send(counterEvents.increment({ value: 42 }));
  }

  public decrement() {
    this.counterActor.send(counterEvents.decrement({ value: 42 }));
  }

  public reset() {
    this.counterActor.send(counterEvents.reset());
  }
}
