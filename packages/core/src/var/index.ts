import {
  type ChartVar,
  type ChartStringVar,
  type ChartBoolVar,
  type ChartNumVar,
  type ChartExpression,
  type ChartDict,
  type ChartAny,
} from './types';
import { chart } from '../utils/format';

export type WriteChart = (...params: Parameters<typeof chart>) => void;

export type VarProxy<T> = T extends ChartDict
  ? T
  : {
      [key in keyof T]: T[key] extends string
        ? ChartStringVar
        : T[key] extends boolean
          ? ChartBoolVar
          : T[key] extends number
            ? ChartNumVar
            : T[key] extends ChartVar
              ? T[key]
              : VarProxy<T[key]>;
    };

const fieldPath = Symbol('var:field-path');
const isvar = Symbol('var:is-var');
const isexpression = Symbol('var:is-expression');
const expreStr = Symbol('var:epxression-str');

export const createExpression = (str: string): ChartExpression => {
  const expr: ChartExpression = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    [isexpression]: true,
    [expreStr]: str,
    $not: () => chart`not (${expr})`,
    $default: (value: any) => {
      return chart`${expr} | default (${value})`;
    },
    $format: () => str,

    $wrapPth: () => createExpression(`(${str})`),
  };
  return expr;
};

/**
 * Create a proxy for accessing variable
 */
export const createVarProxy = <T = ChartDict>(opt: {
  write: WriteChart;
  // addInstruction: (expr: ChartExpression) => void;
  path?: string;
}): VarProxy<T> => {
  const target = {
    [isvar]: true,
    [isexpression]: true,
    [fieldPath]: opt?.path ?? '$.',
  };

  const varProxy = new Proxy<any>(target, {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        switch (prop) {
          case '$range': {
            return (
              fn: (value: VarProxy<T>, key: VarProxy<string>) => void,
            ) => {
              opt.write`{{- range $key, $value := ${varProxy} -}}`;
              fn(
                createVarProxy({ ...opt, path: '$value' }),
                createVarProxy({ ...opt, path: '$key' }),
              );
              opt.write`{{- end -}}`;
            };
          }
          case '$set': {
            return (
              key: ChartExpression,
              value: ChartExpression | string | number | boolean,
            ) => {
              opt.write`{{- $_ := set ${varProxy} ${key} ${value} -}}`;
            };
          }
          case '$hasKey': {
            return (key: string | ChartExpression) => {
              return chart`hasKey ${varProxy} ${key}`;
            };
          }
          case '$default': {
            return (value: any) => chart`${varProxy} | default ${value}`;
          }
          case '$not': {
            return () => chart`not ${varProxy}`;
          }
          case '$format': {
            return () => {
              const p = target[fieldPath];
              if (p === '$') {
                return '$.';
              }
              return target[fieldPath];
            };
          }
          default:
        }

        if (!(prop in target)) {
          const nestedPath = target[fieldPath].endsWith('.')
            ? `${target[fieldPath]}${prop}`
            : `${target[fieldPath]}.${prop}`;
          target[prop] = createVarProxy({
            ...opt,
            path: nestedPath,
          });
        }
      }
      return target[prop];
    },
    set: (target, prop, value) => {
      opt.write`{{- $_ := set ${varProxy} ${prop} ${value} -}}`;
      return true;
    },
  });

  return varProxy as VarProxy<T>;
};

export const isVar = (obj: any): obj is ChartAny => {
  if (!obj) {
    return false;
  }
  return obj[isvar] === true;
};
export const isExpression = (obj: any): obj is ChartExpression => {
  if (!obj) {
    return false;
  }
  return obj[isexpression] === true;
};
