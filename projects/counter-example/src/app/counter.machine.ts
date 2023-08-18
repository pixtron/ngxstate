import { createAction, props, union } from '@ngrx/store';
import { assign, createMachine, StateFrom } from 'xstate';

const increment = createAction('INCREMENT', props<{ value: number }>());
const decrement = createAction('DECREMENT', props<{ value: number }>());
const reset = createAction('RESET');

export const counterEvents = {
  increment,
  decrement,
  reset,
};

const eventUnion = union(counterEvents);

export const counterMachine = createMachine(
  {
    schema: {
      events: {} as typeof eventUnion,
      context: {} as { count: number },
    },
    tsTypes: {} as import('./counter.machine.typegen').Typegen0,
    context: {
      count: 0,
    },
    on: {
      INCREMENT: { actions: ['increment'] },
      DECREMENT: { actions: ['decrement'] },
      RESET: { actions: ['reset'] },
    },
  },
  {
    actions: {
      increment: assign({ count: (ctx, ev) => ctx.count + ev.value }),
      decrement: assign({ count: (ctx, ev) => ctx.count - ev.value }),
      reset: assign({ count: 0 }),
    },
  }
);

export type CounterState = StateFrom<typeof counterMachine>;
