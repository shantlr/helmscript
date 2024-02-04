import { type ChartExpression } from '../core/builder/baseVar';
import { chart } from '../utils/format';

export const printf = (
  template: string,
  ...args: (string | number | boolean | ChartExpression)[]
) => chart`printf "${template}" ${args}`;
