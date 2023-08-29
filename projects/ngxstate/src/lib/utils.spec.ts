import { arrayShallowEqual, objectShallowEqual } from './utils';

describe('utils objectShallowEqual()', () => {
  it('should return true for 2 objects with same keys and values', () => {
    const a = { name: 'bob' };
    const b = { name: 'bob' };

    expect(objectShallowEqual(a, b)).toEqual(true);
  });

  it('should return false for 2 objects with same keys but different values', () => {
    const a = { name: 'bob' };
    const b = { name: 'max' };

    expect(objectShallowEqual(a, b)).toEqual(false);
  });

  it('should not check recursively', () => {
    const a = { person: { name: 'bob' } };
    const b = { person: { name: 'bob' } };

    expect(objectShallowEqual(a, b)).toEqual(false);
  });

  it('should check refrences', () => {
    const person = { name: 'bob' };
    const a = { person: person };
    const b = { person: person };

    expect(objectShallowEqual(a, b)).toEqual(true);
  });
});

describe('utils arrayShallowEqual', () => {
  it('should return true for 2 arrays with same values', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];

    expect(arrayShallowEqual(a, b)).toEqual(true);
  });

  it('should return false for 2 arrays with different values', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 4];

    expect(arrayShallowEqual(a, b)).toEqual(false);
  });

  it('should check sorting of array values', () => {
    const a = [1, 2, 3];
    const b = [3, 2, 1];

    expect(arrayShallowEqual(a, b)).toEqual(false);
  });

  it('should not check recursively', () => {
    const a = [{ name: 'bob' }];
    const b = [{ name: 'bob' }];

    expect(arrayShallowEqual(a, b)).toEqual(false);
  });

  it('should not check references', () => {
    const person = { name: 'bob' };
    const a = [person];
    const b = [person];

    expect(arrayShallowEqual(a, b)).toEqual(true);
  });
});
