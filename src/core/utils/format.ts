import { isArray } from 'lodash';
import { isVar, varAsPath } from '../varProxy';

const mapArg = (any: any): any => {
  if (isArray(any)) {
    return any.map(mapArg).join(' ');
  }
  if (isVar(any)) {
    return varAsPath(any);
  }
  return any;
};

export const chart = (strings: TemplateStringsArray, ...args: any[]) => {
  const res = [];
  for (let i = 0; i < strings.length; i++) {
    res.push(strings[i]);

    if (i < args.length) {
      const arg = args[i];
      res.push(mapArg(arg));
    }
  }
  return res.join('');
};
