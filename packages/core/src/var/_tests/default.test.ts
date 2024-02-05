import { describe, expect, it, vi } from 'vitest';
import { createVarProxy } from '..';

describe('varProxy/default', () => {
  it('should default string', () => {
    const varProxy = createVarProxy({
      write: vi.fn(),
    });

    expect(
      varProxy.field.$default('hello world').$format(),
    ).toMatchInlineSnapshot(`"$.field | default "hello world""`);
  });
  it('should default number', () => {
    const varProxy = createVarProxy({
      write: vi.fn(),
    });

    expect(varProxy.field.$default(42).$format()).toMatchInlineSnapshot(
      `"$.field | default 42"`,
    );
  });
  it('should default boolean', () => {
    const varProxy = createVarProxy({
      write: vi.fn(),
    });

    expect(varProxy.field.$default(true).$format()).toMatchInlineSnapshot(
      `"$.field | default true"`,
    );
  });
});
