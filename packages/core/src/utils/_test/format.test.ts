import { describe, expect, it } from 'vitest';
import { chart } from '../format';
import { createVarProxy } from '../../varProxy';

describe('core/utils/format', () => {
  it('should simple string', () => {
    expect(chart`hello`.$format()).toBe('hello');
  });

  it('should interpolatte string', () => {
    expect(chart`hello ${'world'}`.$format()).toBe('hello world');
  });

  it('should interporlate var', () => {
    const v = createVarProxy({ addInstruction: () => {} });
    expect(chart`hello ${v}`.$format()).toBe('hello $.');
    expect(chart`world ${v.field}`.$format()).toBe('world $.field');
    expect(chart`{{ ${v.field.nested} }}`.$format()).toBe(
      '{{ $.field.nested }}',
    );
  });

  it('should interpolate array of string', () => {
    expect(chart`hello ${['world', 'foo']}`.$format()).toBe('hello world foo');
  });

  it('should interpolate array with vars', () => {
    const v = createVarProxy({ addInstruction: () => {} });
    expect(
      chart`hello ${['world', v, v.test]}`.$format(),
    ).toMatchInlineSnapshot(`"hello world $. $.test"`);
  });

  it('should interpolate array of expressions', () => {
    expect(
      chart`hello ${[chart`world`, chart`test`]}`.$format(),
    ).toMatchInlineSnapshot(`"hello world test"`);
  });
});
