import { map } from 'lodash';
import { chart } from '../../utils/format';
import { isVar } from '../../varProxy';
import { type ChartExpression } from '../../core/builder/baseVar';

export const valueFromPartialLiteral = <T>(value: T): ChartExpression => {
  if (isVar(value)) {
    return value;
  }
  if (value === null) {
    return chart`nil`;
  }

  if (Array.isArray(value)) {
    return chart`list ${value.map((v) => chart`${valueFromPartialLiteral(v)}`.$wrapPth())}`;
  }

  if (typeof value === 'object') {
    return chart`dict ${map(value, (p, key) => chart`"${key}" (${valueFromPartialLiteral(p)})`)}`;
  }

  return chart`${value}`;
};
