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
      {{- $configmaps := (dict) }}
      {{- if $.Values.env }}
      {{- range $key, $value := $.Values.env -}}
      {{- $name := (printf "%s-%s-env" $.Release.Name $key) }}
      {{- if (hasKey $configmaps $name) }}
      ({{ fail (printf "ConfigMap %s already exists" $name) }})
      {{- end }}
      {{- $cm := (dict "name" $name) }}
      {{- $_ := set $configmaps $name $cm -}}
      {{- end -}}
      {{- end }}

      plugin_valuesEnv.yaml:
      {{- define ""plugin_valuesEnv.env-as-configmap"" }}
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
