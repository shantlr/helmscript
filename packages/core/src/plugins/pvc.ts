import { type Plugin } from '../engine/type';
import { printf } from '../fn';

export const pluginPvc: Plugin = {
  name: 'pvc',
  run: (context) => {
    const step = context.stages.initial.add({
      name: 'Init PVC',
    });
    const {
      vars: {
        Release,
        Values: { pvc },
      },
    } = step;

    const template = context.define('pvc', () => {
      //
    });

    step.if(pvc, () => {
      step.comment('Step pvc default');
      pvc.$range((pvc, key) => {
        pvc.$set('name', pvc.name.$default(printf('%s-%s', Release.Name, key)));
        step.if(pvc.external.$not(), () => {
          step.include(template, pvc);
        });
      });
    });
  },
};
