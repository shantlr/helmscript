import { describe, expect, it, vi } from 'vitest';
import { type ChartExpression } from '../../core/builder/baseVar';
import { createVarProxy } from '..';

describe('varProxy/default', () => {
  it('should default string', () => {
    const res: string[] = [];
    const fn = vi.fn((expr: ChartExpression) => res.push(expr.$format()));
    const varProxy = createVarProxy({
      addInstruction: fn,
    });

    expect(
      varProxy.field.$default('hello world').$format(),
    ).toMatchInlineSnapshot(`"$.field | default "hello world""`);
  });
  it('should default number', () => {
    const res: string[] = [];
    const fn = vi.fn((expr: ChartExpression) => res.push(expr.$format()));
    const varProxy = createVarProxy({
      addInstruction: fn,
    });

    expect(varProxy.field.$default(42).$format()).toMatchInlineSnapshot(
      `"$.field | default 42"`,
    );
  });
  it('should default boolean', () => {
    const res: string[] = [];
    const fn = vi.fn((expr: ChartExpression) => res.push(expr.$format()));
    const varProxy = createVarProxy({
      addInstruction: fn,
    });

    expect(varProxy.field.$default(true).$format()).toMatchInlineSnapshot(
      `"$.field | default true"`,
    );
  });
});
