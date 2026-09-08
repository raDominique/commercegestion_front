import LogoImage from '../../assets/logo/logo.png';
import { cn } from '../ui/utils';

/**
 * Coquille auth — flat design, minimaliste, sans ombre.
 * Palette : violet-600 / violet-700 + neutres, fond blanc / neutral-50.
 * Unique : bandeau marque à gauche + panneau formulaire à droite,
 * aplats unis, aucun motif / gradient / blur / shadow.
 */
export function AuthShell({ children, className }) {
  return (
    <div
      className={cn(
        'flex min-h-screen w-full flex-col bg-neutral-50 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Panneau marque (gauche) — aplat violet-600 uni, sans motif d'arrière-plan.
 */
export function BrandPanel({ eyebrow = 'Etokisana', title, subtitle, children, className }) {
  return (
    <aside
      className={cn(
        'hidden w-full bg-violet-600 text-white lg:flex lg:flex-col lg:p-12',
        className,
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-white p-1.5">
            <img src={LogoImage} alt="Logo Etokisana" className="h-full w-full object-contain" />
          </span>
          <div className="leading-tight">
            <p className="text-base font-bold tracking-tight">Etokisana</p>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-200">
              Commerce & gestion
            </p>
          </div>
        </div>

        <div className="mt-12">
          {eyebrow && (
            <span className="inline-flex items-center border border-white/30 bg-violet-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
              {eyebrow}
            </span>
          )}
          {title && (
            <h1 className="mt-5 max-w-md text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-4 max-w-md border-l-2 border-white/40 pl-4 text-base leading-relaxed text-violet-100">
              {subtitle}
            </p>
          )}
        </div>

        {children && <div className="mt-auto pt-12">{children}</div>}
      </div>
    </aside>
  );
}

/**
 * Liste d'arguments flat pour le panneau marque.
 * Carrés numérotés, aplats violet-700, sans ombre.
 */
export function BrandPoints({ points }) {
  if (!points?.length) return null;
  return (
    <ul className="space-y-3">
      {points.map((p, i) => (
        <li key={p.title || i} className="flex items-start gap-3 border border-white/20 bg-violet-700 px-4 py-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-white text-xs font-bold text-violet-700">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span>
            <span className="block text-sm font-semibold leading-snug">{p.title}</span>
            {p.text && <span className="mt-0.5 block text-xs leading-relaxed text-violet-200">{p.text}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Panneau formulaire (droite) — fond blanc, contenu centré, sans ombre.
 */
export function FormPanel({ children, className, wide = false }) {
  return (
    <main className={cn('flex w-full flex-col items-center justify-center bg-white px-4 py-10 sm:px-8 lg:py-12', className)}>
      <div className={cn('w-full', wide ? 'max-w-2xl' : 'max-w-md')}>{children}</div>
    </main>
  );
}

/**
 * En-tête de formulaire — logo mobile + titre + filet plat violet.
 */
export function AuthHeader({ title, subtitle, className }) {
  return (
    <div className={cn('mb-8 text-left', className)}>
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 p-1 lg:hidden">
        <img src={LogoImage} alt="Logo Etokisana" className="h-full w-full object-contain" />
      </span>
      <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-[28px] sm:leading-9">{title}</h2>
      <div aria-hidden="true" className="mt-3 h-1 w-12 bg-violet-600" />
      {subtitle && (
        <p className="mt-4 text-sm leading-relaxed text-neutral-500 sm:text-[15px]">{subtitle}</p>
      )}
    </div>
  );
}

/**
 * Stepper plat pour l'inscription : pastilles carrées + barre de progression.
 */
export function AuthSteps({ steps, current }) {
  return (
    <div className="mb-8">
      <ol className="grid grid-cols-3 border border-neutral-200 bg-neutral-50">
        {steps.map((label, idx) => {
          const active = idx === current;
          const done = idx < current;
          return (
            <li
              key={label}
              className={cn(
                'flex items-center gap-2.5 px-3 py-3 text-left',
                idx > 0 && 'border-l border-neutral-200',
                active && 'bg-violet-600 text-white',
                done && 'bg-violet-50 text-violet-800',
                !active && !done && 'text-neutral-500',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center text-[11px] font-bold',
                  active && 'bg-white text-violet-700',
                  done && 'bg-violet-600 text-white',
                  !active && !done && 'bg-neutral-200 text-neutral-600',
                )}
              >
                {done ? '✓' : `0${idx + 1}`}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold leading-tight">{label}</span>
                <span className={cn('block text-[11px] leading-tight', active ? 'text-violet-100' : done ? 'text-violet-500' : 'text-neutral-400')}>
                  {done ? 'Terminé' : active ? 'En cours' : `Étape 0${idx + 1}`}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <div aria-hidden="true" className="mt-px h-1 w-full bg-neutral-200">
        <div
          className="h-1 bg-violet-600 transition-all duration-300"
          style={{ width: `${((current + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
