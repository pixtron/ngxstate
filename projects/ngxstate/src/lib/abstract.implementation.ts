import { AnyStateMachine } from 'xstate';

import { MachineImplementation } from './types';

export abstract class AbstractImplementation<TMachine extends AnyStateMachine> {
  public abstract getImplementation(): MachineImplementation<TMachine>;
}
