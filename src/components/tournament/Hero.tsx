import { ArrowRight, CalendarRange, Swords, Trophy, Users } from 'lucide-react';
import { eventPeriod } from '../../lib/display';
import { useLiveStatus, useTournament } from '../../state/context';
import { Logo } from '../brand/Logo';
import { SponsorTicker } from '../sponsors/SponsorTicker';
import { HeroBackdrop } from './HeroBackdrop';
import { NextMatchCard } from './NextMatchCard';
import { PhaseBadge } from './PhaseBadge';

export function Hero() {
  const { model } = useTournament();
  const { phase, currentStage } = useLiveStatus();
  const { config, stats } = model;
  const period = eventPeriod(config);
  const firstStage = model.matches.map((m) => m.definition.stage)[0];

  const stageText =
    phase === 'completed'
      ? 'Encerrado'
      : currentStage
        ? config.stages[currentStage].label
        : firstStage
          ? config.stages[firstStage].label
          : '—';
  const stageCaption = phase === 'not-started' ? 'Primeira fase' : 'Fase atual';

  const facts = [
    { icon: CalendarRange, label: 'Período', value: period.short },
    { icon: Users, label: 'Equipes', value: String(stats.totalTeams) },
    { icon: Swords, label: 'Formato', value: config.formatLabel },
    { icon: Trophy, label: stageCaption, value: stageText },
  ];

  return (
    <section id="inicio" aria-labelledby="inicio-titulo" className="relative -mt-[var(--header-h)] overflow-hidden pt-[var(--header-h)]">
      <HeroBackdrop />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:grid-cols-[1.25fr_minmax(0,0.95fr)] lg:gap-16 lg:px-8 lg:pt-24 lg:pb-24">
        <div className="animate-fade-up">
          <div className="flex flex-wrap items-center gap-2">
            <PhaseBadge phase={phase} />
            <span className="chip px-2.5 py-1">{config.game}</span>
          </div>

          <p className="mt-8 font-display text-base font-semibold tracking-[0.3em] text-fg-muted uppercase sm:text-lg">
            {config.tagline}
          </p>
          <h1 id="inicio-titulo" className="mt-3">
            <Logo placement="hero" />
          </h1>
          <SponsorTicker className="mt-6" />

          <dl className="mt-9 grid grid-cols-2 border-y border-line sm:grid-cols-4">
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className={`py-4 pr-3 ${i % 2 === 1 ? 'pl-4 sm:pl-5' : 'sm:pl-5'} ${i > 0 ? 'sm:border-l' : 'sm:pl-0'} ${
                  i % 2 === 1 ? 'border-l' : ''
                } ${i >= 2 ? 'border-t sm:border-t-0' : ''} border-line`}
              >
                <dt className="flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-[0.16em] text-fg-dim uppercase">
                  <fact.icon className="size-3.5" aria-hidden="true" />
                  {fact.label}
                </dt>
                <dd className="mt-1.5 font-display text-xl leading-tight font-bold text-fg uppercase">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#chaveamento" className="btn btn-primary">
              Ver chaveamento <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a href="#partidas" className="btn btn-ghost">
              Partidas e horários
            </a>
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:120ms]">
          <NextMatchCard />
        </div>
      </div>
    </section>
  );
}
