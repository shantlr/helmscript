import {
  type ChartVar,
  type ChartStringVar,
  type ChartBoolVar,
  type ChartNumVar,
  type ChartExpression,
} from '../core/builder/baseVar';
import { type ChartDict } from '../core/builder/dict';
import { chart } from '../utils/format';

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

export const createExpression = (str: string): ChartExpression => {
  return {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    [isexpression]: true,
    $not: () => chart`not (${str})`,
    $format: () => str,
  };
};

/**
 * Create a proxy for accessing variable
 */
export const createVarProxy = <T = any>(opt: {
  addInstruction: (expr: ChartExpression) => void;
  path?: string;
}): VarProxy<T> => {
  const target = {
    [isvar]: true,
    [isexpression]: true,
    [fieldPath]: opt?.path ?? '$',
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return new Proxy(target, {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        switch (prop) {
          case '$range': {
            return (
              fn: (value: VarProxy<T>, key: VarProxy<string>) => void,
            ) => {
              opt.addInstruction(
                chart`{{- range $key, $value := ${target[fieldPath]} -}}`,
              );
              fn(
                createVarProxy({ ...opt, path: '$value' }),
                createVarProxy({ ...opt, path: '$key' }),
              );
              opt.addInstruction(chart`{{- end -}}`);
            };
          }
          case '$set': {
            return (key: string, value: any) => {
              opt.addInstruction(
                chart`{{- $_ := set ${target[fieldPath]} "${key}" (${value}) -}}`,
              );
            };
          }
          case '$default': {
            return (value: any) => {
              return chart`${target[fieldPath]} | default (${value})`;
            };
          }
          case '$not': {
            return () => chart`not (${target[fieldPath]})`;
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          target[prop] = createVarProxy({
            ...opt,
            path: `${target[fieldPath]}.${prop}`,
          });
        }
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return target[prop];
    },
  });
};

export const isVar = (obj: any): obj is VarProxy<any> => {
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
