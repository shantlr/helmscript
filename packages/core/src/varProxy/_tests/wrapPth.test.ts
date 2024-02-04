import { describe, expect, it } from 'vitest';
import { chart } from '../../utils/format';

describe('varProxy/wrapPth', () => {
  it('should wrap path', () => {
    const expr = chart`hello`;
    expect(expr.$wrapPth().$format()).toBe('(hello)');
  });
});
