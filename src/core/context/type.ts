import { type ChartVar } from '../builder/baseVar';
import { type ChartIfBuilder } from '../builder/if';
import { type ChartUtils } from '../utils/type';
import { type VarProxy } from '../varProxy';

export interface Step<Vars> {
  name: string;
  vars: Vars;
  utils: ChartUtils;

  comment: (str: string) => void;
  if: ChartIfBuilder;
  def: (fn: () => void) => void;
  assign: <T>(name: string, value: VarProxy<T>) => VarProxy<T>;
  toString: () => string;
}
