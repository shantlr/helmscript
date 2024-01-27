import { type ChartStringVar } from '../builder/baseVar';

export type ChartUtils = {
  printf: (template: string, ...args: any[]) => string;
};
