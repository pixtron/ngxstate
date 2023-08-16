import { TestBed } from '@angular/core/testing';

import { map } from 'rxjs';
import { assign, createMachine } from 'xstate';

import { AbstractActor } from './abstract.actor';
import { useActor } from './use-actor';

type Context = {
  count: number;
  other: number;
  name: string;
};

function setup(context: Partial<Context> = {}) {
  const machine = createMachine<Context>({
    predictableActionArguments: true,
    initial: 'active',
    context: Object.assign(
      {
        other: 0,
        count: 0,
        name: 'max',
      },
      context
    ),
    states: {
      active: {},
    },
    on: {
      OTHER: {
        actions: assign({ other: ctx => ctx.other + 1 }),
      },
      INCREMENT: {
        actions: assign({ count: ctx => ctx.count + 1 }),
      },
      CHANGE_NAME: {
        actions: assign({ name: (_, e) => e['name'] }),
      },
    },
  });

  class TestActor extends AbstractActor<typeof machine> {
    public actor = useActor(machine);
  }

  return new TestActor();
}

describe('AbstractActor', () => {
  describe('select()', () => {
    it('only emits when the selected value changed', () => {
      TestBed.runInInjectionContext(() => {
        let emits = 0;

        const actor = setup();

        const count$ = actor.select(state => state.context.count);

        count$.subscribe({
          next: () => emits++,
        });

        actor.send({ type: 'OTHER' });
        actor.send({ type: 'OTHER' });
        actor.send({ type: 'OTHER' });
        actor.send({ type: 'OTHER' });

        expect(emits).toEqual(1);

        actor.send({ type: 'INCREMENT' });

        expect(emits).toEqual(2);
      });
    });

    it('should emit the current value', () => {
      TestBed.runInInjectionContext(() => {
        let emits = 0;
        let count = 0;

        const actor = setup({ count });

        const count$ = actor.select(state => state.context.count);

        actor.send({ type: 'INCREMENT' });
        actor.send({ type: 'INCREMENT' });
        actor.send({ type: 'INCREMENT' });

        count$.subscribe({
          next: c => {
            emits++;
            count = c;
          },
        });

        expect(count).toEqual(3);
        expect(emits).toEqual(1);
      });
    });

    it('should immediately complete with the current value, when subscribing to a stoped actor', () => {
      TestBed.runInInjectionContext(() => {
        let count = 0;
        let emits = 0;
        let completed = false;

        const actor = setup({ count });

        const count$ = actor.select(state => state.context.count);

        actor.send({ type: 'INCREMENT' });
        actor.send({ type: 'INCREMENT' });
        actor.send({ type: 'INCREMENT' });
        actor.actor.stop();

        count$.subscribe({
          next: c => {
            emits++;
            count = c;
          },
          complete: () => (completed = true),
        });

        expect(count).toEqual(3);
        expect(emits).toEqual(1);
        expect(completed).toEqual(true);
      });
    });

    it('should work with a custom comparison function', () => {
      TestBed.runInInjectionContext(() => {
        let name = 'david';
        let emits = 0;

        const actor = setup({ name });

        const name$ = actor.select(
          state => state.context.name,
          (a, b) => a.toUpperCase() === b.toUpperCase()
        );

        name$.subscribe({
          next: n => {
            emits++;
            name = n;
          },
        });

        actor.send({ type: 'CHANGE_NAME', name: 'DAVID' });

        expect(emits).toEqual(1);
        expect(name).toEqual('david');

        actor.send({ type: 'CHANGE_NAME', name: 'Bob' });

        expect(emits).toEqual(2);
        expect(name).toEqual('Bob');
      });
    });
  });

  describe('selectSignal()', () => {
    it('tracks the selected value', () => {
      TestBed.runInInjectionContext(() => {
        const actor = setup();

        const count = actor.selectSignal(state => state.context.count);

        actor.send({ type: 'OTHER' });
        expect(count()).toEqual(0);

        actor.send({ type: 'INCREMENT' });
        expect(count()).toEqual(1);

        actor.send({ type: 'INCREMENT' });
        expect(count()).toEqual(2);
      });
    });

    it('should emit the current value', () => {
      TestBed.runInInjectionContext(() => {
        const actor = setup({ count: 0 });

        actor.send({ type: 'INCREMENT' });
        actor.send({ type: 'INCREMENT' });
        actor.send({ type: 'INCREMENT' });

        const count = actor.selectSignal(state => state.context.count);
        expect(count()).toEqual(3);
      });
    });

    it('should emit the current value, when selecting from a stoped actor', () => {
      TestBed.runInInjectionContext(() => {
        const actor = setup({ count: 0 });

        actor.send({ type: 'INCREMENT' });
        actor.send({ type: 'INCREMENT' });
        actor.send({ type: 'INCREMENT' });
        actor.actor.stop();

        const count = actor.selectSignal(state => state.context.count);
        expect(count()).toEqual(3);
      });
    });

    it('should work with a custom comparison function', () => {
      TestBed.runInInjectionContext(() => {
        const actor = setup({ name: 'david' });

        const name = actor.selectSignal(
          state => state.context.name,
          (a, b) => a.toUpperCase() === b.toUpperCase()
        );

        actor.send({ type: 'CHANGE_NAME', name: 'DAVID' });
        expect(name()).toEqual('david');

        actor.send({ type: 'CHANGE_NAME', name: 'Bob' });
        expect(name()).toEqual('Bob');
      });
    });
  });

  describe('pipe()', () => {
    it('emits on each state change', () => {
      TestBed.runInInjectionContext(() => {
        let emits = 0;

        const actor = setup();

        const count$ = actor.pipe(map(state => state.context.count));

        count$.subscribe({
          next: () => emits++,
        });

        actor.send({ type: 'OTHER' });
        actor.send({ type: 'OTHER' });
        actor.send({ type: 'OTHER' });
        actor.send({ type: 'OTHER' });

        expect(emits).toEqual(5);

        actor.send({ type: 'INCREMENT' });

        expect(emits).toEqual(6);
      });
    });

    it('should emit the current state upon subscription', () => {
      TestBed.runInInjectionContext(() => {
        let emits = 0;
        let count = 0;

        const actor = setup({ count });

        const count$ = actor.pipe(map(state => state.context.count));

        actor.send({ type: 'INCREMENT' });
        actor.send({ type: 'INCREMENT' });
        actor.send({ type: 'INCREMENT' });

        count$.subscribe({
          next: c => {
            emits++;
            count = c;
          },
        });

        expect(count).toEqual(3);
        expect(emits).toEqual(1);
      });
    });

    it('should immediately complete with the current value, when subscribing to a stoped actor', () => {
      TestBed.runInInjectionContext(() => {
        let count = 0;
        let emits = 0;
        let completed = false;

        const actor = setup({ count });

        const count$ = actor.pipe(map(state => state.context.count));

        actor.send({ type: 'INCREMENT' });
        actor.send({ type: 'INCREMENT' });
        actor.send({ type: 'INCREMENT' });
        actor.actor.stop();

        count$.subscribe({
          next: c => {
            emits++;
            count = c;
          },
          complete: () => (completed = true),
        });

        expect(count).toEqual(3);
        expect(emits).toEqual(1);
        expect(completed).toEqual(true);
      });
    });
  });
});
