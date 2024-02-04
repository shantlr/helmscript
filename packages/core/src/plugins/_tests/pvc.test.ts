import { describe, expect, it } from 'vitest';
import { chartcompose } from '../..';
import { pluginPvc } from '../pvc';

describe('plugins/pvc', () => {
  it('should', () => {
    const res = chartcompose({
      plugins: [pluginPvc],
    });
    expect(res.toString()).toMatchInlineSnapshot(`
      "compose.yaml:
      {{- if $.Values.pvc }}
      {{- /* Step pvc default */ -}}
      {{- range $key, $value := $.Values.pvc -}}
      {{- $_ := set $value "name" ($value.name | default (printf "%s-%s" $.Release.Name $key)) -}}
      {{- if not ($value.external) }}
      {{- include "plugin_pvc.pvc" (dict "pvc" ($value)) }}
      {{- end }}
      {{- end -}}
      {{- end }}

      plugin_pvc.yaml:
      {{- define "plugin_pvc.pvc" }}
      ---
      {{- with $.pvc }}
      kind: PersistenVolumeClaim
      apiVersion: v1
      metadata:
        name: {{ .name }}
      spec:
        accessModes:
          {{ toYaml .accessModes | nindent 4 }}
        storageClassName: {{ .storageClassName }}
        {{- with .resources }}
        resources:
          {{ toYaml . | nindent 4 }}
        {{- end }}
        {{- with .selector }}
        selector:
          {{ toYaml . | nindent 4 }}
        {{- end }}
        {{- with .volumeMode }}
        volumeMode: {{ . }}
        {{- end }}
        {{- with .volumeName }}
        volumeName: {{ . }}
        {{- end }}
        {{- with .dataSource }}
        dataSource:
          {{ toYaml . | nindent 4 }}
        {{- end }}
        {{- with .storageos }}
        storageos:
          {{ toYaml . | nindent 4 }}
        {{- end }}
      {{- end}}
      {{- end }}"
    `);
  });
});
