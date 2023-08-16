import {
  AnyStateMachine,
  AreAllImplementationsAssumedToBeProvided,
  InternalMachineOptions,
} from 'xstate';

export type Comparator<T> = (prev: T, next: T) => boolean;

export type MachineImplementation<
  TMachine extends AnyStateMachine,
  TRequireMissingImplementations extends
    boolean = AreAllImplementationsAssumedToBeProvided<
    TMachine['__TResolvedTypesMeta']
  > extends false
    ? true
    : false,
> = InternalMachineOptions<
  TMachine['__TContext'],
  TMachine['__TEvent'],
  TMachine['__TResolvedTypesMeta'],
  TRequireMissingImplementations
>;
