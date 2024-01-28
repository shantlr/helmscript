import { type ChartDict } from './dict';

export interface ChartExpression {
  $not: () => ChartExpression;
  $format: () => string;
}

export interface RangeBuilder {
  (fn: (value: ChartDict, key: ChartStringVar) => void): void;
  meta: (meta: { description: string }) => RangeBuilder;
}

export interface ChartVar extends ChartExpression {
  $range: RangeBuilder;
  /**
   * equivalent to `{{- $_ := set $var field (value) -}}`
   */
  $set: (field: string, value: ChartVar) => void;
  /**
   * Get value of default to provided value
   *
   * equivalent to
   * `$var | default (value)`
   */
  $default: (value: ChartExpression) => this;
}

export interface ChartStringVar extends ChartVar {}

export interface ChartBoolVar extends ChartVar {}
export interface ChartNumVar extends ChartVar {}
