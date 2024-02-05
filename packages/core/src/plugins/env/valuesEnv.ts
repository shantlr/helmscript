import { type ChartDict } from '../../var/types';
import { type Plugin } from '../../engine/types';
import { fail, printf } from '../../fn';

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

    const configmaps = step.$assign<Record<string, {}>>('configmaps', {});

    const {
      vars: {
        Values: { env },
      },
      $if,
      write,
    } = step;

    step.$if(env, () => {
      env.$range((env, key) => {
        const name = step.$assign(
          'name',
          printf('%s-%s-env', step.vars.Release.Name, key),
        );
        $if(configmaps.$hasKey(name), () => {
          write`${fail(printf('ConfigMap %s already exists', name))}`;
        });
        const cm = step.$assign('cm', {
          name,
        });

        configmaps.$set(name, cm);
      });
    });
  },
};
