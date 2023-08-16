import { assign, createMachine } from 'xstate';

export const counterMachine = createMachine(
  {
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
      increment: assign({ count: ctx => ctx.count + 1 }),
      decrement: assign({ count: ctx => ctx.count - 1 }),
      reset: assign({ count: 0 }),
    },
  }
);
