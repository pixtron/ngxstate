export function isInjectionContextMissing(err: unknown): boolean {
  return !!(
    err &&
    typeof err === 'object' &&
    'code' in err &&
    err.code === -203
  );
}

export function defaultComparator(prev: unknown, next: unknown) {
  return prev === next;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function objectShallowEqual(objA: any, objB: any) {
  if (Object.is(objA, objB)) return true;

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !Object.is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function arrayShallowEqual(arrA: any, arrB: any) {
  if (Object.is(arrA, arrB)) return true;

  if (!Array.isArray(arrA) || !Array.isArray(arrB)) {
    return false;
  }

  if (arrA.length !== arrB.length) return false;

  for (const [i, v] of arrA.entries()) {
    if (!Object.is(v, arrB[i])) return false;
  }

  return true;
}
