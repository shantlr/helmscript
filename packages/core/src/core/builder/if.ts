import { type ChartVar } from './baseVar';

export type ChartIfBuilder = (condition: ChartVar, fn: () => void) => void;

export const createIf = () => {};
