import { type ChartExpression } from '../var/types';
import { chart } from '../utils/format';

export const printf = (
  template: string,
  ...args: (string | number | boolean | ChartExpression)[]
) => chart`printf ${template} ${args}`;

export const fail = (msg: string | ChartExpression) => chart`{{ fail ${msg} }}`;
