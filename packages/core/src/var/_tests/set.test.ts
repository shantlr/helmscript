import { describe, expect, it, vi } from 'vitest';
import { createVarProxy } from '..';
import { chart } from '../../utils/format';

describe('varProxy/set', () => {
  it('should add a set instruction using mutation', () => {
    const res: string[] = [];
    const fn = vi.fn((...args: Parameters<typeof chart>) =>
      res.push(chart(...args).$format()),
    );
    const varProxy = createVarProxy({
      write: fn,
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    varProxy.field = 'hello world';
    expect(res.join('\n')).toMatchInlineSnapshot(
      `"{{- $_ := set $. "field" "hello world" -}}"`,
    );
  });
  it('should add a set instruction using $set', () => {
    const res: string[] = [];
    const fn = vi.fn((...args: Parameters<typeof chart>) =>
      res.push(chart(...args).$format()),
    );
    const varProxy = createVarProxy({
      write: fn,
    });

    varProxy.$set('field', 'hello world');
    expect(res.join('\n')).toMatchInlineSnapshot(
      `"{{- $_ := set $. "field" "hello world" -}}"`,
    );
  });
});
