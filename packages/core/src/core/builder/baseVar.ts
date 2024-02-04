export interface ChartExpression {
  $not: () => ChartExpression;
  /**
   * Get value of default to provided value
   *
   * equivalent to
   * `$var | default (value)`
   */
  $default: (
    value: boolean | number | string | ChartExpression,
  ) => ChartExpression;
  $format: () => string;

  $wrapPth: () => ChartExpression;
}

export interface ChartVar extends ChartExpression {
  /**
   * equivalent to `{{- $_ := set $var field (value) -}}`
   */
  $set: (field: string, value: ChartExpression) => void;
}

export type RangeBuilder<Item, Key> = (
  fn: (value: Item, key: Key) => void,
) => void;
export interface ChartIterable<Item, Key = ChartStringVar> {
  $range: RangeBuilder<Item, Key>;
}

export type ChartAny = ChartVar &
  ChartIterable<ChartAny> & {
    [key: string]: ChartAny;
  };

export type ChartDict<Shape = ChartAny> = ChartVar &
  ChartIterable<ChartDict> & {
    [key in keyof Shape]: Shape[key];
  };

export interface ChartStringVar extends ChartVar {}

export interface ChartBoolVar extends ChartVar {}
export interface ChartNumVar extends ChartVar {}

/**
 * Map any chart var to a type that allow partial literal
 * e.g ChartDict<{ name: string }>
 * will be mapped to
 * ChartAny | ChartDict<{ name: string }> | { name: string | ChartAny | ChartStringVar }
 */
export type ChartVarToPartialLiteral<T> =
  T extends ChartDict<infer Shape>
    ? ChartVarToPartialLiteral<Shape>
    :
        | (T extends Record<string, any>
            ?
                | {
                    [key in keyof T]: ChartVarToPartialLiteral<T[key]>;
                  }
                | ChartDict
            : T extends string
              ? string | ChartStringVar
              : T extends number
                ? number | ChartNumVar
                : T extends boolean
                  ? boolean | ChartBoolVar
                  : T)
        | ChartAny;

export type PartialLiteralToChartVar<T> = T extends ChartVar
  ? T
  : T extends Record<string, any>
    ? ChartDict<{
        [key in keyof T]: PartialLiteralToChartVar<T[key]>;
      }>
    : T extends string
      ? ChartStringVar
      : T extends number
        ? ChartNumVar
        : T extends boolean
          ? ChartBoolVar
          : T;
