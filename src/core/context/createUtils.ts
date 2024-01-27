import { chart } from '../utils/format';
import { type ChartUtils } from '../utils/type';

export const createUtils = () => {
  const utils: ChartUtils = {
    printf: (template, ...args) => {
      return chart`printf "${template}" ${args}`;
    },
  };
  return utils;
};
