import { type ChartExpression } from '../builder/baseVar';

export type ChartUtils = {
  printf: (template: string, ...args: any[]) => ChartExpression;
};
