import { createVarProxy } from '../varProxy';
import {
  type ChartFile,
  type ChartComposeEngine,
  type Step,
  type UseScope,
  type Scope,
  type ChartComposeEngineStage,
} from './type';
import { createStep } from './createStep';
import { type HelmChartBuiltin } from '../types';
import { type ChartDict } from '../core/builder/dict';
import { type ChartExpression } from '../core/builder/baseVar';
import { chart } from '../utils/format';
import { sortBy } from 'lodash';
import { writeFile } from 'fs/promises';
import path from 'path';

const createFile = ({
  path,
  useScope,
  addInstruction,
}: {
  path: string;
  useScope: UseScope;
  addInstruction: (expr: ChartExpression) => void;
}): ChartFile => {
  const vars = createVarProxy<{
    Values: ChartDict;
    Chart: HelmChartBuiltin['Chart'];
    Release: HelmChartBuiltin['Release'];
  }>({
    addInstruction,
  });

  const fileStages: ChartComposeEngineStage[] = [];

  const createStage: ChartFile['createStage'] = () => {
    const steps: Step<any>[] = [];
    const stage: ChartComposeEngineStage = {
      add: (opt?: { name?: string }) => {
        const step = createStep<typeof vars>({
          name: opt?.name,
          vars,
          addInstruction,
          useScope,
        });

        steps.push(step);

        return step;
      },
      format() {
        const res = steps.map((step) => step.toString());
        return res.join('\n');
      },
    };

    fileStages.push(stage);

    return stage;
  };

  const defineStage = createStage();

  const file: ChartFile = {
    path: `${path}.yaml`,
    define: (name, def) => {
      const step = defineStage.add({ name });
      step(({ write }) => {
        write(chart`{{- define "${name}" }}`);
        def({ step, params: createVarProxy({ addInstruction: write }), write });
        write(chart`{{- end }}`);
      });
      return {
        name,
      };
    },
    createStage,
    toString() {
      const res = fileStages.map((stage) => stage.format());
      return res.filter((r) => r).join('\n');
    },
  };
  return file;
};

export const createChartComposeEngine = () => {
  const stack: Scope[] = [];
  const useScope = (scope: Scope, fn: () => void) => {
    try {
      stack.push(scope);
      fn();
    } finally {
      stack.pop();
    }
  };
  const addInstruction = (instr: ChartExpression) => {
    const last = stack[stack.length - 1];
    if (!last) {
      throw new Error('Stack is empty');
    }
    last.add(instr);
  };

  const files: ChartFile[] = [];

  const engine: ChartComposeEngine = {
    files,
    createFile: (path) => {
      const file = createFile({
        path: `${path}`,
        useScope,
        addInstruction,
      });
      files.push(file);
      return file;
    },
    write: async ({ dir }) => {
      await Promise.all(
        files.map(async (f) => {
          await writeFile(path.resolve(dir, f.path), f.toString());
        }),
      );
    },
    toString: () => {
      return sortBy(files, (f) => f.path)
        .map((f) => `${f.path}:\n${f.toString()}`)
        .join('\n\n');
    },
  };
  return engine;
};
