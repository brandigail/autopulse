import { useRegisterSW } from 'virtual:pwa-register/react'

/** Shown when a new version is waiting, or once the app is ready to work offline. The user decides when to reload. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh && !offlineReady) return null

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-20 z-20 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-teal-200 bg-white p-3 text-sm shadow-lg dark:border-teal-900 dark:bg-slate-900 md:bottom-4"
    >
      <p className="flex-1">{needRefresh ? 'A new version of AutoPulse is ready.' : 'AutoPulse now works offline.'}</p>
      {needRefresh && (
        <button
          type="button"
          onClick={() => void updateServiceWorker(true)}
          className="rounded-lg bg-teal-700 px-3 py-2 font-medium text-white hover:bg-teal-800"
        >
          Reload
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          setNeedRefresh(false)
          setOfflineReady(false)
        }}
        className="rounded-lg border border-slate-300 px-3 py-2 font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        Dismiss
      </button>
    </div>
  )
}
