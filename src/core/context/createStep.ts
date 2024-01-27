import { chart } from '../utils/format';
import { type ChartUtils } from '../utils/type';
import { type VarProxy, createVarProxy, isVar } from '../varProxy';
import { type Step } from './type';

export const createStep = <T>(opt: {
  name?: string;
  vars: T;
  addInstruction: (str: string) => void;
  useScope: (
    scope: { add: (str: string) => void },
    fn: () => void,
    uniq?: boolean,
  ) => void;
  utils: ChartUtils;
}): Step<T> => {
  const { addInstruction, useScope, utils } = opt;

  const instructions: string[] = [];
  const scope = {
    add: (str: string) => {
      instructions.push(str);
    },
  };

  const step: Step<T> = {
    name: opt?.name ?? 'unamed-step',
    vars: opt.vars,
    comment: (str) => {
      step.def(() => {
        addInstruction(chart`{{- /* ${str} */ -}}`);
      });
    },
    if: (condition, fn) => {
      step.def(() => {
        addInstruction(chart`{{- if ${condition} }}`);
        fn();
        addInstruction(chart`{{- end }}`);
      });
    },
    assign: <T>(name: string, value: VarProxy<T>) => {
      step.def(() => {
        addInstruction(chart`{{- $${name} := ${value} }}`);
      });

      return createVarProxy<T>({
        addInstruction,
        path: `${name}`,
      });
    },

    utils,

    def: (fn: () => void) => {
      useScope(scope, fn, true);
    },
    toString: () => {
      return instructions.join('\n');
    },
  };

  return step;
};
