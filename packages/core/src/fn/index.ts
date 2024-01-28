import { ChartExpression } from '../core/builder/baseVar';
import { chart } from '../utils/format';

export const printf = (template: string, ...args: ChartExpression[]) =>
  chart`printf "${template}" ${args}`;
