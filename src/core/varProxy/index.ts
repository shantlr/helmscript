import {
  type ChartVar,
  type ChartStringVar,
  type ChartBoolVar,
  type ChartNumVar,
} from '../builder/baseVar';
import { chart } from '../utils/format';

export type VarProxy<T> = {
  [key in keyof T]: T[key] extends string
    ? ChartStringVar
    : T[key] extends boolean
      ? ChartBoolVar
      : T[key] extends number
        ? ChartNumVar
        : T[key] extends ChartVar
          ? T[key]
          : VarProxy<T[key]>;
} & {
  [key: string]: VarProxy<any>;
};

const fieldPath = Symbol('var:field-path');
const isvar = Symbol('var:is-var');
export const createVarProxy = <T>(opt: {
  addInstruction: (str: string) => void;
  path?: string;
}): VarProxy<T> => {
  const target = {
    [isvar]: true,
    [fieldPath]: opt?.path ?? '',
  };

  return new Proxy(target, {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        switch (prop) {
          case '$range': {
            return (
              fn: (value: VarProxy<T>, key: VarProxy<string>) => void,
            ) => {
              opt.addInstruction(
                `{{- range $key, $value := ${target[fieldPath]} -}}`,
              );
              fn(
                createVarProxy({ ...opt, path: '$value' }),
                createVarProxy({ ...opt, path: '$key' }),
              );
              opt.addInstruction('{{- end -}}');
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
              // opt.addInstruction(
              //   `${} default ${target[fieldPath]} ${value} -}}`,
              // );
            };
          }
          default:
        }
        if (!(prop in target)) {
          target[prop] = createVarProxy({
            ...opt,
            path: `${target[fieldPath]}.${prop}`,
          });
        }
      }
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
export const varAsPath = (varProxy: VarProxy<any>) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return varProxy[fieldPath] || '.';
};
