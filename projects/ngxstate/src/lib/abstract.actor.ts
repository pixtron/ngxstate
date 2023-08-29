import { inject, Injector, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  defer,
  distinctUntilChanged,
  from,
  map,
  Observable,
  OperatorFunction,
  shareReplay,
  startWith,
} from 'rxjs';
import { AnyStateMachine, EventFrom, InterpreterFrom, StateFrom } from 'xstate';

import { Comparator } from './types';
import { defaultComparator } from './utils';

export abstract class AbstractActor<
  TMachine extends AnyStateMachine,
  State = StateFrom<TMachine>,
> {
  public abstract readonly actor: InterpreterFrom<TMachine>;

  protected readonly injector = inject(Injector);

  protected _state$: Observable<State> | null = null;

  pipe<A>(op1: OperatorFunction<State, A>): Observable<A>;

  pipe<A, B>(
    op1: OperatorFunction<State, A>,
    op2: OperatorFunction<A, B>
  ): Observable<B>;

  pipe<A, B, C>(
    op1: OperatorFunction<State, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>
  ): Observable<C>;

  pipe<A, B, C, D>(
    op1: OperatorFunction<State, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>
  ): Observable<D>;

  pipe<A, B, C, D, E>(
    op1: OperatorFunction<State, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
  ): Observable<E>;

  pipe<A, B, C, D, E, F>(
    op1: OperatorFunction<State, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>
  ): Observable<F>;

  pipe<A, B, C, D, E, F, G>(
    op1: OperatorFunction<State, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>
  ): Observable<G>;

  pipe<A, B, C, D, E, F, G, H>(
    op1: OperatorFunction<State, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>
  ): Observable<H>;

  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<State, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>
  ): Observable<I>;

  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<State, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>,
    ...operations: OperatorFunction<unknown, unknown>[]
  ): Observable<unknown>;

  public pipe(
    op1: OperatorFunction<State, unknown>,
    ...operations: OperatorFunction<unknown, unknown>[]
  ): Observable<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.state$.pipe as any)(op1, ...operations);
  }

  public send(event: EventFrom<TMachine>): State {
    return this.actor.send(event) as State;
  }

  public select<T = unknown>(
    projector: (state: State) => T,
    comparator: Comparator<T> = defaultComparator
  ): Observable<T> {
    return this.state$.pipe(
      map(snapshot => projector(snapshot)),
      distinctUntilChanged(comparator)
    );
  }

  public selectSignal<T = unknown>(
    projector: (state: State) => T,
    comparator: Comparator<T> = defaultComparator
  ): Signal<T> {
    return toSignal(this.select(projector, comparator), {
      injector: this.injector,
      requireSync: true,
    });
  }

  protected get state$(): Observable<State> {
    if (this._state$ === null) {
      // Defer to get the current snapshot upon first subscription
      this._state$ = defer(() => {
        return from(this.actor).pipe(
          startWith(this.actor.getSnapshot()),
          distinctUntilChanged(),
          shareReplay(1)
        ) as Observable<State>;
      });
    }

    return this._state$!;
  }
}
