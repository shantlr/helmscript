import { isArray } from 'lodash';
import { createExpression, isExpression } from '../varProxy';
import { type ChartExpression } from '../core/builder/baseVar';

const mapArg = (any: any): string => {
  if (isArray(any)) {
    return any.map(mapArg).join(' ');
  }
  if (isExpression(any)) {
    return any.$format();
  }
  return any.toString();
};

export const chart = (
  strings: TemplateStringsArray,
  ...args: any[]
): ChartExpression => {
  const res: string[] = [];
  for (let i = 0; i < strings.length; i++) {
    res.push(strings[i]);

    if (i < args.length) {
      const arg = args[i];
      res.push(mapArg(arg));
    }
  }
  return createExpression(res.join(''));
};
