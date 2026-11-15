import { Link } from 'react-router-dom'
import { seedDemoData } from '../db/seedDemo'
import { useActiveVehicle } from '../providers/activeVehicle'
import { cardClass, mutedText, primaryButton, secondaryButton } from './ui'

/** Shown by every screen that needs a vehicle before there is one. */
export function NoVehicle() {
  const { setActiveId } = useActiveVehicle()
  return (
    <section className={`${cardClass} space-y-3 text-center`}>
      <h2 className="text-lg font-semibold">Add a vehicle to get started</h2>
      <p className={mutedText}>Services, fuel and reminders are tracked per vehicle.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link to="/vehicles" className={primaryButton}>
          Add a vehicle
        </Link>
        <button type="button" className={secondaryButton} onClick={async () => setActiveId(await seedDemoData())}>
          Load the demo 4x4
        </button>
      </div>
    </section>
  )
}
