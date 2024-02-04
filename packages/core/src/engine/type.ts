import { type HelmChartBuiltin } from '../types';
import {
  type ChartExpression,
  type ChartDict,
  type ChartVar,
  type ChartVarToPartialLiteral,
} from '../core/builder/baseVar';

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

export interface Step<Vars> {
  name: string;
  (fn: (arg: { write: (expr: ChartExpression) => void }) => void): void;

  vars: Vars;

  comment: (str: string) => void;
  if: (condition: ChartExpression, fn: () => void) => void;
  assign: <T extends ChartExpression>(name: string, value: T) => T;
  include: StepInclude;
  toString: () => string;
}
export interface StepBuilder<Vars> {
  add: (opt?: { name: string }) => Step<Vars>;
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
  add: (opt?: { name?: string }) => Step<PluginVars>;
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
      step: Step<any>;
      params: TemplateParams;
      write: (expr: ChartExpression) => void;
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
    def: (arg: {
      params: Param;
      write: (expr: ChartExpression) => void;
    }) => void,
  ) => ChartTemplate<Param extends ChartVar ? Param : ChartDict<Param>>;
}
export type Plugin = {
  name: string;
  run: (context: PluginContext) => void;
};
