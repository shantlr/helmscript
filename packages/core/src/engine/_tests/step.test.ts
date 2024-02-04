import { describe, expect, it } from 'vitest';
import { createChartComposeEngine } from '..';

describe('engine/step', () => {
  it('should render if', () => {
    const context = createChartComposeEngine();
    const file = context.createFile('test.yaml');
    const step = file.createStage().add({ name: 'step' });
    step.$if(step.vars, () => {});
    expect(step.toString()).toMatchInlineSnapshot(`
      "{{- if $. }}
      {{- end }}"
    `);
  });
  it('should render if else', () => {
    const context = createChartComposeEngine();
    const file = context.createFile('test.yaml');
    const step = file.createStage().add({ name: 'step' });
    step.$if(
      step.vars,
      () => {},
      (chain) => {
        chain.else(() => {});
      },
    );
    expect(step.toString()).toMatchInlineSnapshot(`
      "{{- if $. }}
      {{- else }}
      {{- end }}"
    `);
  });
});
