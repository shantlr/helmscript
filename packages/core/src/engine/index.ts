import { type WriteChart, createVarProxy } from '../varProxy';
import {
  type ChartFile,
  type ChartComposeEngine,
  type ChartFragment,
  type UseScope,
  type Scope,
  type ChartComposeEngineStage,
} from './type';
import { createStep } from './createStep';
import { sortBy } from 'lodash';
import { writeFile } from 'fs/promises';
import path from 'path';
import { createWriteChart } from './utils/createWrite';

const createFile = ({
  path,
  useScope,
  write,
}: {
  path: string;
  useScope: UseScope;
  write: WriteChart;
}): ChartFile => {
  const vars = createVarProxy<any>({
    write,
  });

  const fileStages: ChartComposeEngineStage[] = [];

  const createStage: ChartFile['createStage'] = () => {
    const steps: ChartFragment<any>[] = [];
    const stage: ChartComposeEngineStage = {
      add: (opt?: { name?: string }) => {
        const step = createStep<any>({
          name: opt?.name,
          useScope,
          vars,
          write,
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
      const step = defineStage.add<any>({ name });
      step(({ write }) => {
        write`{{- define "${name}" }}`;
        def({ fragment: step, write });
        write`{{- end }}`;
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
  const write = createWriteChart((expr) => {
    const last = stack[stack.length - 1];
    if (!last) {
      throw new Error('Stack is empty');
    }
    last.add(expr);
  });

  const files: ChartFile[] = [];

  const engine: ChartComposeEngine = {
    files,
    createFile: (path) => {
      const file = createFile({
        path: `${path}`,
        write,
        useScope,
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
