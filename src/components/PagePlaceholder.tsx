export function PagePlaceholder({ title }: { title: string }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Coming soon.</p>
    </section>
  )
}
