import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import { build, md1Win, withResults, withSchedule } from './helpers';

const BEFORE_EVENT = new Date('2026-10-08T22:00:00-03:00');
const render = (model = build(), now = BEFORE_EVENT) => renderToString(<App model={model} fixedNow={now} />);

describe('interface', () => {
  it('exibe os horários calculados pela agenda central', () => {
    const html = render();
    expect(html).toContain('20:30');
    expect(html).toContain('Fase preliminar');
    expect(html).not.toContain('Oitavas');
  });

  it('reflete a mudança de duração das modalidades', () => {
    const before = render();
    const after = render(build(undefined, withSchedule({ durationsMinutes: { MD1: 75, MD3: 120 } })));
    expect(before).not.toContain('20:15');
    expect(after).toContain('20:15');
    expect(after).toContain('22:45');
    expect(after).toContain('21:00');
    expect(after).toContain('MD1 ≈ <!-- -->75<!-- --> min');
  });

  it('reflete um horário fixo configurado para uma partida', () => {
    const html = render(build(withResults({ 'PRE-03': { fixedTime: '21:20' } })));
    expect(html).toContain('21:20');
  });

  it('mostra "A definir" para vagas sem participante e não declara campeão', () => {
    const html = render();
    expect(html).toContain('A definir');
    expect(html).toContain('Não iniciado');
    expect(html).not.toContain('id="campeao"');
  });

  it('atualiza o chaveamento quando um resultado é registrado', () => {
    const html = render(build(withResults({ 'PRE-01': md1Win(1) })), new Date('2026-10-12T20:10:00-03:00'));
    expect(html).toContain('Em andamento');
    expect(html).toContain('Eliminada');
    expect(html).toContain('Classificada');
  });
});
