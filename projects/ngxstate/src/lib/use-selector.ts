import {
  defer,
  distinctUntilChanged,
  from,
  map,
  Observable,
  startWith,
} from 'rxjs';
import { AnyActorRef, Subscribable } from 'xstate';

import { Comparator } from './types';
import { defaultComparator } from './utils';

export function useSelector<
  TActor extends AnyActorRef,
  T,
  TEmitted = TActor extends Subscribable<infer Emitted> ? Emitted : never,
>(
  actor: TActor,
  projector: (emitted: TEmitted) => T,
  comparator: Comparator<T> = defaultComparator
): Observable<T> {
  // Defer to get the current snapshot upon subscription
  return defer(() =>
    from(actor).pipe(
      startWith(actor.getSnapshot()),
      map(snapshot => projector(snapshot)),
      distinctUntilChanged(comparator)
    )
  );
}
