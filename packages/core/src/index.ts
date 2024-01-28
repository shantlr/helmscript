import { type Plugin, type PluginVars } from './engine/type';
import { createChartComposeEngine } from './engine';

export const chart = () => {};

export const netpols = () => {};

export const svcs = () => {};

export const vault = () => {};

export const secretFiles = () => {};

export const library = () => {};

export const chartcompose = ({
  dir,
  plugins,
}: {
  dir: string;
  plugins: Plugin[];
}) => {
  const context = createChartComposeEngine({
    dir,
  });
  const compose = context.createFile('compose');

  const allSteps = {
    init: compose.createStage(),
    initial: compose.createStage(),
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
    const pluginFile = context.createFile(`plugin_${plugin.name}`);
    const define = (templateName: string, def: () => void) => {
      return pluginFile.define(`plugin_${plugin.name}.${templateName}`, def);
    };

    plugin.run({
      vars,
      define,
      stages: pluggableSteps,
    });
  });

  return context;
};
