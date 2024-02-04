import { describe, expect, it, vi } from 'vitest';
import { createVarProxy } from '..';
import { type ChartExpression } from '../../core/builder/baseVar';

describe('varProxy/set', () => {
  it('should add a set instruction', () => {
    const res: string[] = [];
    const fn = vi.fn((expr: ChartExpression) => res.push(expr.$format()));
    const varProxy = createVarProxy({
      addInstruction: fn,
    });

    varProxy.field = 'hello world';
    expect(res.join('\n')).toMatchInlineSnapshot(
      `"{{- $_ := set $ "field" "hello world" -}}"`,
    );
  });
});
