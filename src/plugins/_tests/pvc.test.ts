import { describe, expect, it } from 'vitest';
import { chartcompose } from '../..';
import { pluginPvc } from '../pvc';

describe('plugins/pvc', () => {
  it('should', () => {
    const res = chartcompose({
      plugins: [pluginPvc],
    });
    expect(res).toMatchInlineSnapshot(`
      "{{- $values := .Values }}
      {{- $chart := .Chart }}
      {{- $release := .Release }}

      {{- if .Values.pvc }}
      {{- /* Step pvc default */ -}}
      {{- range $key, $value := .Values.pvc -}}
      {{- $_ := set $value "name" ($value.name | default (printf "%s-%s" .Release.Name $key)) -}}
      {{- end -}}
      {{- end }}"
    `);
  });
});
