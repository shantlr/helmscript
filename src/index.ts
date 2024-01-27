import { type PluginVars, type Plugin } from './core/plugins/type';
import { createChartContext } from './core/context';
import { type HelmChartBuiltin } from './types';
import { type ChartDict } from './core/builder/dict';

export const chart = () => {};

export const netpols = () => {};

export const svcs = () => {};

export const vault = () => {};

export const secretFiles = () => {};

export const library = () => {};

export const chartcompose = ({ plugins }: { plugins: Plugin[] }) => {
  const context = createChartContext();

  const allSteps = {
    init: context.createStage(),
    initial: context.createStage(),
  };

  const pluggableSteps = {
    initial: allSteps.initial,
  };

  let vars: PluginVars;
  // #region init
  {
    const step = allSteps.init.add({ name: 'Init vars' });

    // NOTE: we are bindig vars so they are still usable in nested range
    const values = step.assign('values', step.vars.Values);
    const chart = step.assign('chart', step.vars.Chart);
    const release = step.assign('release', step.vars.Release);

    vars = {
      Values: values,
      Chart: chart,
      Release: release,
    };
  }
  // #endregion

  plugins.forEach((plugin) => {
    plugin({
      vars,
      stages: pluggableSteps,
    });
  });

  const results = [allSteps.init.toString(), allSteps.initial.toString()];
  return results.join('\n\n');
};
