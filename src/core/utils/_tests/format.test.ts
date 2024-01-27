import { describe, expect, it } from 'vitest';
import { chart } from '../format';
import { createVarProxy } from '../../varProxy';

describe('core/utils/format', () => {
  it('should simple string', () => {
    expect(chart`hello`).toBe('hello');
  });

  it('should interpolatte string', () => {
    expect(chart`hello ${'world'}`).toBe('hello world');
  });

  it('should interporlate var', () => {
    const v = createVarProxy({ addInstruction: () => {} });
    expect(chart`hello ${v}`).toBe('hello .');
    expect(chart`world ${v.field}`).toBe('world .field');
    expect(chart`{{ ${v.field.nested} }}`).toBe('{{ .field.nested }}');
  });

  it('should interpolate array of string', () => {
    expect(chart`hello ${['world', 'foo']}`).toBe('hello world foo');
  });
  it('should interpolate array with vars', () => {
    const v = createVarProxy({ addInstruction: () => {} });
    expect(chart`hello ${['world', v, v.test]}`).toBe('hello world . .test');
  });
});
