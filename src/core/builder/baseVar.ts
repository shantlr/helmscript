import { type ChartDict } from './dict';

export interface RangeBuilder {
  (fn: (value: ChartDict, key: ChartStringVar) => void): void;
  meta: (meta: { description: string }) => RangeBuilder;
}

export interface ChartVar {
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
  $default: (value: string | ChartVar) => this;
}

export interface ChartStringVar extends ChartVar {}

export interface ChartBoolVar extends ChartVar {}
export interface ChartNumVar extends ChartVar {}
