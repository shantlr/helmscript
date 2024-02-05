import { flatMap, map } from 'lodash';
import { chart } from '../../utils/format';
import { isExpression } from '../../var';
import { type ChartExpression } from '../../var/types';

export const valueFromPartialLiteral = <T>(value: T): ChartExpression => {
  if (isExpression(value)) {
    return value;
  }
  if (value === null) {
    return chart`nil`;
  }

  if (Array.isArray(value)) {
    return chart`list ${value.map((v) => {
      if (
        typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'boolean'
      ) {
        return v;
      }
      return valueFromPartialLiteral(v);
    })}`;
  }

  if (typeof value === 'object') {
    const args = flatMap(value, (val, key) => {
      if (
        typeof val === 'string' ||
        typeof val === 'number' ||
        typeof val === 'boolean'
      ) {
        return [key, val];
      }
      return [key, valueFromPartialLiteral(val)];
    });
    if (!args.length) {
      return chart`dict`;
    }
    return chart`dict ${args}`;
  }

  return chart`${value}`;
};
