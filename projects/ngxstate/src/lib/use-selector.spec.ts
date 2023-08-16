import { assign, createMachine, interpret } from 'xstate';

import { useSelector } from './use-selector';

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

  return interpret(machine);
}

describe('useSelector()', () => {
  it('only emits when the selected value changed', () => {
    let emits = 0;

    const actor = setup().start();

    const count$ = useSelector(actor, state => state.context.count);

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
    actor.stop();
  });

  it('should emit the current value', () => {
    let emits = 0;
    let count = 0;

    const actor = setup({ count }).start();

    const count$ = useSelector(actor, state => state.context.count);

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
    actor.stop();
  });

  it('should immediately complete with the current value, when subscribing to a stoped actor', () => {
    let count = 0;
    let emits = 0;
    let completed = false;

    const actor = setup({ count }).start();

    const count$ = useSelector(actor, state => state.context.count);

    actor.send({ type: 'INCREMENT' });
    actor.send({ type: 'INCREMENT' });
    actor.send({ type: 'INCREMENT' });
    actor.stop();

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

  it('should work with a custom comparison function', () => {
    let name = 'david';
    let emits = 0;

    const actor = setup({ name }).start();

    const name$ = useSelector(
      actor,
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
    actor.stop();
  });
});
