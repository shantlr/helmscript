import { type HelmChartBuiltin } from '../../types';
import { type ChartDict } from '../builder/dict';
import { type Step } from '../context/type';
import { type VarProxy } from '../varProxy';

interface StepBuilder<Vars> {
  add: (opt?: { name: string }) => Step<Vars>;
}

export type PluginVars = {
  Values: VarProxy<ChartDict>;
  Chart: VarProxy<HelmChartBuiltin['Chart']>;
  Release: VarProxy<HelmChartBuiltin['Release']>;
};

interface PluginContext {
  vars: PluginVars;
  stages: {
    initial: StepBuilder<PluginVars>;
  };
}
export type Plugin = (context: PluginContext) => void;
