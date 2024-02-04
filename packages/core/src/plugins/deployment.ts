import { type Plugin } from '../engine/type';
import { printf } from '../fn';
import { chart } from '../utils/format';

export const pluginDeployment: Plugin = {
  name: 'deployment',
  run: (context) => {
    const step = context.stages.initial.add({
      name: 'Init Deployment',
    });
    const template = context.define<{
      deployment: {
        name: string;
      };
    }>('deployment', ({ params: { deployment }, write }) => {
      write(chart`---
{{- with ${deployment} }}
kind: Deployment
apiVersion: apps/v1
metadata:
  name: {{ .name }}
spec:
  {{- with .replicas }}
  replicas: {{ . }}
  {{- end }}
  {{- with .selector }}
  selector:
    {{ toYaml . | nindent 4 }}
  {{- end }}
  template:
    spec:
      containers:
      - name: {{ .name }}
        image: {{ .image }}
{{- end }}
      `);
    });

    const {
      Values: { services },
      Release,
    } = step.vars;

    step.$if(services, () => {
      services.$range((service) => {
        service.$set(
          'name',
          service.name.$default(printf('%s-%s', Release.Name, service.name)),
        );
      });
    });
  },
};
