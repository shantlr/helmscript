import { type ChartDict } from '../../core/builder/baseVar';
import { type Plugin } from '../../engine/type';

export const pluginValuesEnv: Plugin = {
  name: 'valuesEnv',
  run: (context) => {
    const envAsConfigMap = context.define<{
      cm: {
        name: string;
        values: Record<string, ChartDict>;
      };
    }>(
      'env-as-configmap',
      ({
        fragment: {
          $if,
          vars: { cm },
        },
        write,
      }) => {
        write`---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${cm.name}
data:`;
        cm.values.$range((value, key) => {
          $if(
            value,
            () => {
              write`  {{ ${key} }}: ${value} | toString | quote`;
            },
            (chain) => {
              chain.else(() => {
                write`  {{ ${key} }}: {{ tpl (${value} | toString | quote) $.}`;
              });
            },
          );
        });
      },
    );
    const step = context.stages.initial.add({
      name: 'Init values env',
    });

    const {
      Values: { env },
    } = step.vars;

    step.$if(env, () => {
      env.$range((env, key) => {
        // env.$set('name', key);
      });
    });
  },
};
