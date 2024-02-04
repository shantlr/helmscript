import { describe, expect, it, vi } from 'vitest';
import { createVarProxy } from '../../../varProxy';
import { valueFromPartialLiteral } from '../valueFromPartialLiteral';

describe('engine/utils/valueFromPartiaLiteral', () => {
  it('should map root var', () => {
    const chartVar = createVarProxy({ addInstruction: vi.fn() });
    expect(valueFromPartialLiteral(chartVar).$format()).toMatchInlineSnapshot(
      `"$."`,
    );
  });
  it('should map var path', () => {
    const chartVar = createVarProxy({ addInstruction: vi.fn() });
    expect(
      valueFromPartialLiteral(chartVar.field.nested).$format(),
    ).toMatchInlineSnapshot(`"$.field.nested"`);
  });

  it('should map basic record', () => {
    expect(
      valueFromPartialLiteral({ a: 1, b: 2, c: true, d: false }).$format(),
    ).toMatchInlineSnapshot(`"dict "a" (1) "b" (2) "c" (true) "d" (false)"`);
  });

  it('should map basic list', () => {
    expect(valueFromPartialLiteral([1, 2, 3]).$format()).toMatchInlineSnapshot(
      `"list (1) (2) (3)"`,
    );
  });

  it('should map record that contain array', () => {
    expect(
      valueFromPartialLiteral({ a: [1, 2, 3], b: [4, 5, 6] }).$format(),
    ).toMatchInlineSnapshot(
      `"dict "a" (list (1) (2) (3)) "b" (list (4) (5) (6))"`,
    );
  });

  it('should map record that contain var', () => {
    const chartVar = createVarProxy({ addInstruction: vi.fn() });
    expect(
      valueFromPartialLiteral({ a: chartVar.field.nested }).$format(),
    ).toMatchInlineSnapshot(`"dict "a" ($.field.nested)"`);
  });
  it('should map nested record', () => {
    const chartVar = createVarProxy({ addInstruction: vi.fn() });
    expect(
      valueFromPartialLiteral({ a: { b: 1, c: chartVar.field } }).$format(),
    ).toMatchInlineSnapshot(`"dict "a" (dict "b" (1) "c" ($.field))"`);
  });

  it('should map array that contain record', () => {
    const chartVar = createVarProxy({ addInstruction: vi.fn() });
    expect(
      valueFromPartialLiteral([
        { a: 1, b: { field: chartVar.field } },
        1,
      ]).$format(),
    ).toMatchInlineSnapshot(
      `"list (dict "a" (1) "b" (dict "field" ($.field))) (1)"`,
    );
  });

  it('should map number', () => {
    expect(valueFromPartialLiteral(1).$format()).toMatchInlineSnapshot(`"1"`);
  });
  it('should map boolean', () => {
    expect(valueFromPartialLiteral(true).$format()).toMatchInlineSnapshot(
      `"true"`,
    );
  });
  it('should map string', () => {
    expect(valueFromPartialLiteral('hello').$format()).toMatchInlineSnapshot(
      `"hello"`,
    );
  });
});
