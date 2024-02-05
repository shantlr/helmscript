import { isArray } from 'lodash';
import { createExpression, isExpression, isVar } from '../var';
import { type ChartExpression } from '../var/types';

const mapArg = (any: any): string => {
  if (isArray(any)) {
    return any.map(mapArg).join(' ');
  }
  if (isVar(any)) {
    return any.$format();
  }
  if (isExpression(any)) {
    return `(${any.$format()})`;
  }
  if (typeof any === 'string') {
    return `"${any}"`;
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
