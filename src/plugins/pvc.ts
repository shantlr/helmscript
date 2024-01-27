import { type Plugin } from '../core/plugins/type';

export const pluginPvc: Plugin = (context) => {
  const step = context.stages.initial.add({
    name: 'Init PVC',
  });
  const {
    vars: {
      Release,
      Values: { pvc },
    },
    utils: { printf },
  } = step;

  step.if(pvc, () => {
    step.comment('Step pvc default');
    pvc.$range((pvc, key) => {
      pvc.$set('name', pvc.name.$default(printf('%s-%s', Release.Name, key)));
    });
  });
};
