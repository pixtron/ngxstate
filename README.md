# Ngxstate

This library contains utilities for using [XState](https://github.com/statelyai/xstate) with [Angular](https://github.com/angular/angular#readme).

## Usage

### Use an actor

```ts
import { Component, Injectable } from '@angular/core';
import { createMachine, assign } from 'xstate';
import { AbstractActor, useActor } from 'ngxstate';

const counterMachine = createMachine({
  context: {
    count: 0,
  }
  on: {
    INC: {
      actions: [assign({count: (context) => context.count + 1})]
    }
  }
});

@Injectable({
  providedIn: 'root',
})
export class CounterActor extends AbstractActor<typeof counterMachine> {
  public readonly actor = useActor(counterMachine);
}

@Component({
  template: `
    <h1>{{ count$ | async }}</h1>
    <button (click)="increment()">+</button>
  `
})
export class MyComponent {
  private counterActor = inject(CounterActor);

  public count$ = this.counterActor.select(state => state.context.count);

  public increment() {
    this.counterActor.send({type: 'INC'});
  }
}
```

### Provide machine implementation

```ts
import { Injectable } from '@angular/core';
import { createMachine, assign } from 'xstate';
import { AbstractActor, AbstractImplementation, useActor } from 'ngxstate';

const counterMachine = createMachine({
  context: {
    count: 0,
  }
  on: {
    INC: {
      actions: ['increment']
    }
  }
});

type CounterMachine = typeof counterMachine;

@Injectable({
  providedIn: 'root',
})
export class CounterImplementation extends AbstractImplementation<CounterMachine> {
  public getImplementation(): MachineImplementation<CounterMachine> {
    return {
      actions: {
        increment: assign({ count: context => context.count + 42 }),
      },
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class CounterActor extends AbstractActor<CounterMachine> {
  public readonly actor = useActor(counterMachine, {
    implementation: inject(CounterImplementation)
  });
}
```

### Rehydrate state

```ts
@Injectable({
  providedIn: 'root',
})
export class CounterActor extends AbstractActor<CounterMachine> {
  public readonly actor = useActor(counterMachine, {
    state: JSON.parse(localStorage.getItem('counterSnapshot')) || undefined
  });

  public persistState() {
    const snapshot = this.actor.getSnapshot();
    localStorage.setItem('counterSnapshot', JSON.stringify(snapshot));
  }
}
```
