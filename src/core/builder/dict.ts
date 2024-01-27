import { type ChartVar } from './baseVar';

export type ChartDict = ChartVar & {
  [key: string]: ChartDict;
};
