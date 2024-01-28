import { describe, expect, it } from 'vitest';
import { chartcompose } from '../..';
import { pluginPvc } from '../pvc';

describe('plugins/pvc', () => {
  it('should', () => {
    const res = chartcompose({
      dir: './chart',
      plugins: [pluginPvc],
    });
    expect(res.toString()).toMatchInlineSnapshot(`
      "./chart/compose.yaml:
      {{- $values := .Values }}
      {{- $chart := .Chart }}
      {{- $release := .Release }}
      {{- if .Values.pvc }}
      {{- /* Step pvc default */ -}}
      {{- range $key, $value := .Values.pvc -}}
      {{- $_ := set $value "name" ($value.name | default (printf "%s-%s" .Release.Name $key)) -}}
      {{- if not ($value.external) }}
      {{- include "plugin_pvc.pvc" }}
      {{- end }}
      {{- end -}}
      {{- end }}

      ./chart/plugin_pvc.yaml:
      {{- define "plugin_pvc.pvc" }}
      {{- end }}"
    `);
  });
});
