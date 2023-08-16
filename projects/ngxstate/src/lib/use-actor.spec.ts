import { TestBed } from '@angular/core/testing';

import * as xstate from 'xstate';
import { assign, createMachine, InterpreterStatus } from 'xstate';

import { AbstractImplementation } from './abstract.implementation';
import { MachineImplementation } from './types';
import { useActor } from './use-actor';

const noop = () => {
  /* noop */
};

describe('useActor()', () => {
  const machine = createMachine(
    {
      predictableActionArguments: true,
      context: {
        count: 0,
      },
      initial: 'inactive',
      states: {
        inactive: {
          on: { ACTIVATE: 'active' },
        },
        active: {
          on: { DEACTIVATE: 'inactive' },
        },
      },
      on: {
        INCREMENT: {
          actions: 'increment',
        },
        DECREMENT: {
          actions: 'decrement',
        },
      },
    },
    {
      actions: {
        increment: assign({ count: ctx => ctx.count + 1 }),
        decrement: assign({ count: ctx => ctx.count - 1 }),
      },
    }
  );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should start the actor in the initial state', () => {
    TestBed.runInInjectionContext(() => {
      const actor = useActor(machine);
      expect(actor.status).toEqual(InterpreterStatus.Running);

      const snapshot = actor.getSnapshot();
      expect(snapshot.matches('inactive')).toEqual(true);
    });
  });

  it('should start the actor in a given state', () => {
    TestBed.runInInjectionContext(() => {
      const state = JSON.parse(
        '{"actions":[],"activities":{},"meta":{},"events":[],"value":"active","context":{"count":2},"_event":{"name":"INCREMENT","data":{"type":"INCREMENT"},"$$type":"scxml","type":"external"},"_sessionid":"x:0","event":{"type":"INCREMENT"},"historyValue":{"current":"active","states":{}},"history":{"actions":[],"activities":{},"meta":{},"events":[],"value":"active","context":{"count":1},"_event":{"name":"INCREMENT","data":{"type":"INCREMENT"},"$$type":"scxml","type":"external"},"_sessionid":"x:0","event":{"type":"INCREMENT"},"historyValue":{"current":"active","states":{}},"children":{},"done":false,"changed":true,"tags":[]},"children":{},"done":false,"changed":true,"tags":[]}'
      );

      const actor = useActor(machine, { state });
      expect(actor.status).toEqual(InterpreterStatus.Running);

      const snapshot = actor.getSnapshot();
      expect(snapshot.matches('active')).toEqual(true);
      expect(snapshot.context.count).toEqual(2);
    });
  });

  it('should start the actor with a given context', () => {
    TestBed.runInInjectionContext(() => {
      const actor = useActor(machine, { context: { count: 42 } });
      expect(actor.status).toEqual(InterpreterStatus.Running);

      const snapshot = actor.getSnapshot();
      expect(snapshot.matches('inactive')).toEqual(true);
      expect(snapshot.context.count).toEqual(42);
    });
  });

  it('should start the actor with a given implementation', () => {
    TestBed.runInInjectionContext(() => {
      const actor = useActor(machine, {
        implementation: {
          actions: {
            increment: assign({ count: ctx => ctx.count + 42 }),
            decrement: assign({ count: ctx => ctx.count - 42 }),
          },
        },
      });
      expect(actor.status).toEqual(InterpreterStatus.Running);

      actor.send({ type: 'INCREMENT' });

      const snapshot = actor.getSnapshot();
      expect(snapshot.matches('inactive')).toEqual(true);
      expect(snapshot.context.count).toEqual(42);
    });
  });

  it('should start the actor with a given implementation service', () => {
    class TestImplementation extends AbstractImplementation<typeof machine> {
      public getImplementation(): MachineImplementation<typeof machine> {
        return {
          actions: {
            increment: assign({ count: ctx => ctx.count + 62 }),
            decrement: assign({ count: ctx => ctx.count - 62 }),
          },
        };
      }
    }

    TestBed.runInInjectionContext(() => {
      const actor = useActor(machine, {
        implementation: new TestImplementation(),
      });
      expect(actor.status).toEqual(InterpreterStatus.Running);

      actor.send({ type: 'INCREMENT' });

      const snapshot = actor.getSnapshot();
      expect(snapshot.matches('inactive')).toEqual(true);
      expect(snapshot.context.count).toEqual(62);
    });
  });

  it('should start the actor with default interpreter options', () => {
    TestBed.runInInjectionContext(() => {
      const interpretSpy = jest.spyOn(xstate, 'interpret');

      useActor(machine);

      expect(interpretSpy).toHaveBeenCalledTimes(1);
      expect(interpretSpy).toHaveBeenLastCalledWith(expect.anything(), {
        devTools: true,
      });

      interpretSpy.mockRestore();
    });
  });

  it('should start the actor with given interpreter options', () => {
    TestBed.runInInjectionContext(() => {
      const interpretSpy = jest.spyOn(xstate, 'interpret');

      const implementation = {
        actions: {
          increment: noop,
        },
      };

      useActor(machine, {
        devTools: false,
        id: 'main',
        context: { count: 62 },
        implementation,
      });

      expect(interpretSpy).toHaveBeenCalledTimes(1);
      expect(interpretSpy).toHaveBeenLastCalledWith(expect.anything(), {
        devTools: false,
        id: 'main',
      });

      interpretSpy.mockRestore();
    });
  });

  it('should stop the actor upon on destroy', () => {
    let actor;
    TestBed.runInInjectionContext(() => {
      actor = useActor(machine);
      expect(actor.status).toEqual(InterpreterStatus.Running);
    });

    TestBed.resetTestEnvironment();
    expect(actor!.status).toEqual(InterpreterStatus.Stopped);
  });

  it('should warn when actor is used outside an injection context', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(noop);

    const actor = useActor(machine);
    expect(actor.status).toEqual(InterpreterStatus.Running);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "useActor() has been called outside an injection context. The actor won't be stopped on destroy."
    );

    actor.stop();
    warnSpy.mockRestore();
  });
});
