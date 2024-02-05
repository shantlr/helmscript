import { type HelmChartBuiltin } from '../types';
import {
  type ChartExpression,
  type ChartDict,
  type ChartVar,
  type ChartVarToPartialLiteral,
  type PartialLiteralToChartVar,
} from '../var/types';
import { type WriteChart } from '../var';

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

export type StepInclude = {
  <TemplateParams>(
    template: ChartTemplate<TemplateParams>,
    params: ChartVarToPartialLiteral<TemplateParams>,
  ): void;
  (template: ChartTemplate<undefined>, params?: undefined): void;
};

interface IfElse {
  elseif: (condition: ChartExpression, fn: () => void) => IfElse;
  else: (fn: () => void) => void;
}
type If = (
  condition: ChartExpression,
  fn: () => void,
  elseif?: (c: IfElse) => void,
) => void;
export interface ChartFragment<Vars> {
  name: string;
  (fn: (arg: { write: WriteChart }) => void): void;
  write: WriteChart;

  vars: PartialLiteralToChartVar<Vars>;

  $comment: (str: string) => void;
  $if: If;
  $assign: <T>(
    name: string,
    value: T | ChartExpression,
  ) => PartialLiteralToChartVar<T>;
  $include: StepInclude;

  toString: () => string;
}
export interface StepBuilder<Vars> {
  add: (opt?: { name: string }) => ChartFragment<Vars>;
}

export type PluginVars = {
  Values: ChartDict;
  Chart: ChartDict<HelmChartBuiltin['Chart']>;
  Release: ChartDict<HelmChartBuiltin['Release']>;
};

export type ChartComposeEngineStage = {
  /**
   * Add step into stage
   */
  add: <Params = PluginVars>(opt?: { name?: string }) => ChartFragment<Params>;
  /**
   * Format stage into helm chart format
   */
  format: () => string;
};

export type ChartFile = {
  path: string;
  createStage: () => ChartComposeEngineStage;
  define: <TemplateParams>(
    name: string,
    def: (arg: {
      fragment: ChartFragment<TemplateParams>;
      write: WriteChart;
    }) => void,
  ) => ChartTemplate<TemplateParams>;
  toString: () => string;
};

export type ChartComposeEngine = {
  files: ChartFile[];
  createFile: (path: string) => ChartFile;
  write: (opt: { dir: string }) => Promise<void>;

  toString: () => string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface ChartTemplate<Params> {
  name: string;
}

export interface PluginContext {
  vars: PluginVars;
  stages: {
    initial: StepBuilder<PluginVars>;
  };
  define: <Param>(
    name: string,
    def: (arg: { fragment: ChartFragment<Param>; write: WriteChart }) => void,
  ) => ChartTemplate<Param extends ChartVar ? Param : ChartDict<Param>>;
}
export type Plugin = {
  name: string;
  run: (context: PluginContext) => void;
};
