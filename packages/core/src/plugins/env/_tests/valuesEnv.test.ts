import { describe, expect, it } from 'vitest';
import { chartcompose } from '../../..';
import { pluginValuesEnv } from '../valuesEnv';

describe('plugin/valuesEnv', () => {
  it('should', () => {
    const res = chartcompose({
      plugins: [pluginValuesEnv],
    });
    expect(res.toString()).toMatchInlineSnapshot(`
      "compose.yaml:
      {{- if $.Values.env }}
      {{- range $key, $value := $.Values.env -}}
      {{- end -}}
      {{- end }}

      plugin_valuesEnv.yaml:
      {{- define "plugin_valuesEnv.env-as-configmap" }}
      ---
      apiVersion: v1
      kind: ConfigMap
      metadata:
        name: $.cm.name
      data:
      {{- range $key, $value := $.cm.values -}}
      {{- if $value }}
        {{ $key }}: $value | toString | quote
      {{- else }}
        {{ $key }}: {{ tpl ($value | toString | quote) $.}
      {{- end }}
      {{- end -}}
      {{- end }}"
    `);
  });
});
