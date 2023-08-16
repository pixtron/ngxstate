import { DestroyRef, inject, InjectionToken, isDevMode } from '@angular/core';

import {
  AnyStateMachine,
  AreAllImplementationsAssumedToBeProvided,
  interpret,
  InterpreterFrom,
  InterpreterOptions,
  State,
  StateConfig,
} from 'xstate';

import { AbstractImplementation } from './abstract.implementation';
import { MachineImplementation } from './types';
import { isInjectionContextMissing } from './utils';

export const DEFAULT_INTERPRETER_OPTIONS =
  new InjectionToken<InterpreterOptions>('default interpreter options', {
    factory: () => ({
      devTools: isDevMode(),
    }),
  });

export type UseActorOptions<
  TMachine extends AnyStateMachine,
  TRequireMissingImplementations extends boolean,
> = InterpreterOptions & {
  /**
   * If provided, will be merged with machine's `context`.
   */
  context?: Partial<TMachine['__TContext']>;
  /**
   * The state to rehydrate the machine to. The machine will
   * start at this state instead of its `initialState`.
   */
  state?: StateConfig<TMachine['__TContext'], TMachine['__TEvent']>;
} & (TRequireMissingImplementations extends true
    ? {
        implementation:
          | MachineImplementation<TMachine, true>
          | AbstractImplementation<TMachine>;
      }
    : {
        implementation?:
          | MachineImplementation<TMachine, false>
          | AbstractImplementation<TMachine>;
      });

export type UseActorRestParams<TMachine extends AnyStateMachine> =
  AreAllImplementationsAssumedToBeProvided<
    TMachine['__TResolvedTypesMeta']
  > extends false
    ? [options: UseActorOptions<TMachine, true>]
    : [options?: UseActorOptions<TMachine, false>];

function getInterpreterOptions(options: InterpreterOptions) {
  let defaultOptions: InterpreterOptions = {};

  try {
    defaultOptions = inject(DEFAULT_INTERPRETER_OPTIONS);
  } catch (err) {
    if (!isInjectionContextMissing(err)) throw err;
  }

  return Object.assign({}, defaultOptions, options);
}

export function useActor<TMachine extends AnyStateMachine>(
  machine: TMachine,
  ...[options = {}]: UseActorRestParams<TMachine>
): InterpreterFrom<TMachine> {
  const {
    context,
    state: rehydratedState,
    implementation = {},
    ...interpreterOptions
  } = options;

  const resolvedImplementation =
    implementation instanceof AbstractImplementation
      ? implementation.getImplementation()
      : implementation;
  const machineWithConfig = machine.withConfig(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolvedImplementation as any,
    () => ({
      ...machine.context,
      ...context,
    })
  );

  const actor = interpret(
    machineWithConfig,
    getInterpreterOptions(interpreterOptions)
  );

  actor.start(rehydratedState ? State.create(rehydratedState) : undefined);

  try {
    inject(DestroyRef).onDestroy(() => actor.stop());
  } catch (err: unknown) {
    if (!isInjectionContextMissing(err)) throw err;

    if (isDevMode()) {
      console.warn(
        "useActor() has been called outside an injection context. The actor won't be stopped on destroy."
      );
    }
  }

  return actor as InterpreterFrom<TMachine>;
}
