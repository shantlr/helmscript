import { describe, expect, it, vi } from 'vitest';
import { createVarProxy } from '..';
import { chart } from '../../utils/format';

describe('varProxy/range', () => {
  it('should create empty range', () => {
    const res: string[] = [];
    const fn = vi.fn((...args: Parameters<typeof chart>) =>
      res.push(chart(...args).$format()),
    );
    const varProxy = createVarProxy({
      write: fn,
    });
    varProxy.$range(() => {});
    expect(res.join('\n')).toMatchInlineSnapshot(`
      "{{- range $key, $value := $. -}}
      {{- end -}}"
    `);
  });

  it('should create range of nested field', () => {
    const res: string[] = [];
    const fn = vi.fn((...args: Parameters<typeof chart>) =>
      res.push(chart(...args).$format()),
    );
    const varProxy = createVarProxy({
      write: fn,
    });
    varProxy.field.$range(() => {});
    expect(res.join('\n')).toMatchInlineSnapshot(`
      "{{- range $key, $value := $.field -}}
      {{- end -}}"
    `);
  });
});
