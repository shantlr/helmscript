import { type Plugin } from '../engine/type';
import { printf } from '../fn';

export const pluginPvc: Plugin = {
  name: 'pvc',
  run: (context) => {
    const step = context.stages.initial.add({
      name: 'Init PVC',
    });
    const template = context.define<{
      pvc: {
        name: string;
      };
    }>(
      'pvc',
      ({
        fragment: {
          vars: { pvc },
        },
        write,
      }) => {
        write`---
{{- with ${pvc} }}
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
{{- end}}`;
      },
    );

    const {
      vars: {
        Release,
        Values: { pvc },
      },
      $if,
      $comment,
      $include,
    } = step;

    $if(pvc, () => {
      $comment('Step pvc default');
      pvc.$range((pvc, key) => {
        pvc.$set('name', pvc.name.$default(printf('%s-%s', Release.Name, key)));
        $if(pvc.external.$not(), () => {
          $include(template, { pvc });
        });
      });
    });
  },
};
