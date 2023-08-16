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
