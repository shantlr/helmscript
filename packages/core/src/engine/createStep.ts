import {
  type PartialLiteralToChartVar,
  type ChartExpression,
} from '../core/builder/baseVar';
import { type WriteChart, createVarProxy } from '../varProxy';
import {
  type UseScope,
  type ChartFragment,
  type Scope,
  type ChartTemplate,
} from './type';
import { valueFromPartialLiteral } from './utils/valueFromPartialLiteral';

export const createStep = <T>(opt: {
  name?: string;
  useScope: UseScope;
  vars: T;
  write: WriteChart;
}): ChartFragment<T> => {
  const { useScope } = opt;

  const instructions: ChartExpression[] = [];
  const scope: Scope = {
    add: (str: ChartExpression) => {
      instructions.push(str);
    },
  };

  const step: ChartFragment<T> = (fn) => {
    useScope(
      scope,
      () => {
        fn({
          write: opt.write,
        });
      },
      true,
    );
  };
  Object.defineProperty(step, 'name', {
    value: opt?.name ?? 'unamed-step',
    enumerable: true,
  });
  step.vars = opt.vars as PartialLiteralToChartVar<any>;
  step.$comment = (str) => {
    step(() => {
      opt.write`{{- /* ${str} */ -}}`;
    });
  };
  step.$if = (condition, fn, chain) => {
    const createElseif = () => {
      return {
        elseif: (condition: ChartExpression, fn: () => void) => {
          step(() => {
            opt.write`{{- else if ${condition} }}`;
            fn();
          });

          return createElseif();
        },
        else: (fn: () => void) => {
          step(() => {
            opt.write`{{- else }}`;
            fn();
          });
        },
      };
    };

    step(() => {
      opt.write`{{- if ${condition} }}`;
      fn();
      if (chain) {
        chain(createElseif());
      }
      opt.write`{{- end }}`;
    });
  };
  step.$assign = ((name: string, value) => {
    step(() => {
      opt.write`{{- $${name} := ${value} }}`;
    });

    return createVarProxy({
      write: opt.write,
      path: `${name}`,
    });
  }) as ChartFragment<T>['$assign'];

  step.$include = (template: ChartTemplate<any>, params: any) => {
    step(() => {
      if (params) {
        opt.write`{{- include "${template.name}" (${valueFromPartialLiteral(params)}) }}`;
        return;
      }
      opt.write`{{- include "${template.name}" }}`;
    });
  };

  step.toString = () => {
    return instructions.map((c) => c.$format()).join('\n');
  };

  return step;
};
