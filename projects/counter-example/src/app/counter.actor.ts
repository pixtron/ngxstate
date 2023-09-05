import { Injectable } from '@angular/core';

import { AbstractActor, useActor } from '@pxtrn/ngxstate';

import { counterMachine } from './counter.machine';

@Injectable({
  providedIn: 'root',
})
export class CounterActor extends AbstractActor<typeof counterMachine> {
  public readonly actor = useActor(counterMachine);
}
