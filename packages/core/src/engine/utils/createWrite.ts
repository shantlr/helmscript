import { type ChartExpression } from '../../core/builder/baseVar';
import { chart } from '../../utils/format';

export const createWriteChart = (
  addInstructon: (expr: ChartExpression) => void,
) => {
  const write = (...params: Parameters<typeof chart>) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = chart(...params);
    addInstructon(res);
  };
  return write;
};
