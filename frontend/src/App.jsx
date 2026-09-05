function App() {
  return (
    <main className="min-h-screen bg-surface-lowest text-text">
      <div className="mx-auto max-w-shell px-[var(--gutter)]">
        <header className="flex h-[var(--header-h)] items-center justify-between">
          <span className="font-display text-2xl font-bold text-primary">
            Fondefos
          </span>
          <span className="rounded-pill bg-accent px-4 py-2 text-surface-lowest shadow-low">
            Token demo
          </span>
        </header>
        <section className="rounded-lg border border-border bg-surface-bright p-8 shadow-low">
          <h1 className="font-display text-3xl font-bold text-ink">
            Sistema de diseño — Fase 1
          </h1>
          <p className="mt-4 font-body text-muted">
            Tema Tailwind v4 extraído de assets/site.css.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-md bg-primary px-4 py-2 text-surface-lowest">
              Primario
            </span>
            <span className="rounded-md bg-interactive px-4 py-2 text-surface-lowest">
              Interactivo
            </span>
            <span className="rounded-md bg-success px-4 py-2 text-surface-lowest">
              Éxito
            </span>
            <span className="rounded-md bg-accent px-4 py-2 text-surface-lowest">
              Énfasis
            </span>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
