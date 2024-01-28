import { type HelmChartBuiltin } from '../types';
import { type ChartExpression, type ChartVar } from '../core/builder/baseVar';
import { type ChartDict } from '../core/builder/dict';
import { type ChartUtils } from '../core/utils/type';
import { type VarProxy } from '../varProxy';

/**
 * Scope for adding instructions
 */
export type Scope = {
  add: (expr: ChartExpression) => void;
};
/**
 * Add Scope to stack and execute fn
 */
export type UseScope = (scope: Scope, fn: () => void, uniq?: boolean) => void;

export interface Step<Vars> {
  name: string;
  (fn: (arg: { write: (expr: ChartExpression) => void }) => void): void;

  vars: Vars;

  comment: (str: string) => void;
  if: (condition: ChartExpression, fn: () => void) => void;
  assign: <T>(
    name: string,
    value: T extends ChartVar
      ? T | VarProxy<T>
      : T extends VarProxy<any>
        ? T
        : VarProxy<T>,
  ) => T extends VarProxy<infer U> ? VarProxy<U> : VarProxy<T>;
  include: (template: ChartDefine) => void;
  toString: () => string;
}
export interface StepBuilder<Vars> {
  add: (opt?: { name: string }) => Step<Vars>;
}

export type PluginVars = {
  Values: VarProxy<ChartDict>;
  Chart: VarProxy<HelmChartBuiltin['Chart']>;
  Release: VarProxy<HelmChartBuiltin['Release']>;
};

export type ChartComposeEngineStage = {
  /**
   * Add step into stage
   */
  add: (opt?: { name?: string }) => Step<PluginVars>;
  /**
   * Format stage into helm chart format
   */
  format: () => string;
};

export type ChartFile = {
  path: string;
  createStage: () => ChartComposeEngineStage;
  define: (
    name: string,
    def: (arg: {
      step: Step<any>;
      write: (expr: ChartExpression) => void;
    }) => void,
  ) => ChartDefine;
  toString: () => string;
};

export type ChartComposeEngine = {
  files: ChartFile[];
  createFile: (path: string) => ChartFile;
  write: (opt: { dir: string }) => void;

  toString: () => string;
};

export interface ChartDefine {
  name: string;
}

export interface PluginContext {
  vars: PluginVars;
  stages: {
    initial: StepBuilder<PluginVars>;
  };
  define: (name: string, def: () => void) => ChartDefine;
}
export type Plugin = {
  name: string;
  run: (context: PluginContext) => void;
};
