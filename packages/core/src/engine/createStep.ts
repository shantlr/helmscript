import { ChartExpression } from '../core/builder/baseVar';
import { chart } from '../utils/format';
import { createVarProxy } from '../varProxy';
import { UseScope, type Step, Scope } from './type';

export const createStep = <T>(opt: {
  name?: string;
  vars: T;
  addInstruction: (expr: ChartExpression) => void;
  useScope: UseScope;
}): Step<T> => {
  const { addInstruction, useScope } = opt;

  const instructions: ChartExpression[] = [];
  const scope: Scope = {
    add: (str: ChartExpression) => {
      instructions.push(str);
    },
  };

  const step: Step<T> = (fn) => {
    useScope(
      scope,
      () =>
        fn({
          write: addInstruction,
        }),
      true,
    );
  };
  Object.defineProperty(step, 'name', {
    value: opt?.name ?? 'unamed-step',
    enumerable: true,
  });
  step.vars = opt.vars;
  step.comment = (str) => {
    step(() => {
      addInstruction(chart`{{- /* ${str} */ -}}`);
    });
  };
  step.if = (condition, fn) => {
    step(() => {
      addInstruction(chart`{{- if ${condition} }}`);
      fn();
      addInstruction(chart`{{- end }}`);
    });
  };
  step.assign = ((name: string, value) => {
    step(() => {
      addInstruction(chart`{{- $${name} := ${value} }}`);
    });

    return createVarProxy({
      addInstruction,
      path: `${name}`,
    });
  }) as Step<T>['assign'];
  step.include = (template) => {
    step(() => {
      addInstruction(chart`{{- include "${template.name}" }}`);
    });
  };

  step.toString = () => {
    return instructions.map((c) => c.$format()).join('\n');
  };

  return step;
};
