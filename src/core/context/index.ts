import { type ChartUtils } from '../utils/type';
import { createVarProxy } from '../varProxy';
import { type Step } from './type';
import { createStep } from './createStep';
import { createUtils } from './createUtils';
import { type HelmChartBuiltin } from '../../types';
import { type ChartDict } from '../builder/dict';

export const createChartContext = () => {
  const stack: { add: (str: string) => void }[] = [];

  const addInstruction = (instr: string) => {
    const last = stack[stack.length - 1];
    if (!last) {
      throw new Error('Stack is empty');
    }
    last.add(instr);
  };

  const utils: ChartUtils = Object.freeze(createUtils());

  const useScope = (scope: (typeof stack)[number], fn: () => void) => {
    try {
      stack.push(scope);
      fn();
    } finally {
      stack.pop();
    }
  };

  const context = {
    stack,
    vars: createVarProxy<{
      Values: ChartDict;
      Chart: HelmChartBuiltin['Chart'];
      Release: HelmChartBuiltin['Release'];
    }>({
      addInstruction,
    }),
    useScope,
    createStage: () => {
      const steps: Step<any>[] = [];
      const stage = {
        add: (opt?: { name?: string }) => {
          const step = createStep<(typeof context)['vars']>({
            name: opt?.name,
            vars: context.vars,
            addInstruction,
            useScope,
            utils,
          });

          steps.push(step);

          return step;
        },
        toString() {
          const res = steps.map((step) => step.toString());
          return res.join('\n');
        },
      };

      return stage;
    },
  };
  return context;
};
