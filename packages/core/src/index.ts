import {
  type PluginContext,
  type Plugin,
  type PluginVars,
} from './engine/type';
import { createChartComposeEngine } from './engine';

export const netpols = () => {};

export const svcs = () => {};

export const vault = () => {};

export const secretFiles = () => {};

export const chartcompose = ({ plugins }: { plugins: Plugin[] }) => {
  const context = createChartComposeEngine();
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
    vars = step.vars;
  }
  // #endregion

  plugins.forEach((plugin) => {
    const pluginFile = context.createFile(`plugin_${plugin.name}`);
    const define: PluginContext['define'] = (templateName, def) => {
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
