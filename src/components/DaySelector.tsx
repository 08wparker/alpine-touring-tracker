'use client'

import { DayTrackGroup } from '@/components/NorwayMap'

interface DaySelectorProps {
  dayTracks: DayTrackGroup[]
  hiddenDays: Set<string>
  onSelectDay: (date: string) => void
  tourNames?: Map<string, string>
  isAdmin?: boolean
  editingDay?: string | null
  editDayName?: string
  onStartRenaming?: (date: string) => void
  onEditDayNameChange?: (name: string) => void
  onSaveDayName?: (date: string) => void
}

export default function DaySelector({
  dayTracks,
  hiddenDays,
  onSelectDay,
  tourNames = new Map(),
  isAdmin = false,
  editingDay = null,
  editDayName = '',
  onStartRenaming,
  onEditDayNameChange,
  onSaveDayName,
}: DaySelectorProps) {
  if (dayTracks.length === 0) return null

  // A day is "selected" if it's the only visible day
  const visibleDays = dayTracks.filter(dg => !hiddenDays.has(dg.date))
  const singleSelected = visibleDays.length === 1 ? visibleDays[0].date : null

  return (
    <div className="mb-3">
      <p className="text-sm text-gray-500 mb-2">Select a tour day to zoom in on the map:</p>
      <div className="flex flex-wrap gap-2">
        {dayTracks.map(dg => {
          const customName = tourNames.get(dg.date)
          const isSelected = singleSelected === dg.date
          const isHidden = hiddenDays.has(dg.date)

          if (editingDay === dg.date) {
            return (
              <form
                key={dg.date}
                onSubmit={e => { e.preventDefault(); onSaveDayName?.(dg.date) }}
                className="flex items-center gap-1 border border-alpine-green rounded-full px-2 py-1"
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dg.color }}></div>
                <input
                  type="text"
                  value={editDayName}
                  onChange={e => onEditDayNameChange?.(e.target.value)}
                  placeholder={dg.label}
                  className="text-sm border-none outline-none w-28 bg-transparent"
                  autoFocus
                  onBlur={() => onSaveDayName?.(dg.date)}
                />
              </form>
            )
          }

          return (
            <div key={dg.date} className="flex items-center gap-0.5">
              <button
                onClick={() => onSelectDay(dg.date)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  isSelected
                    ? 'border-2 bg-white shadow-sm'
                    : isHidden
                      ? 'opacity-40 border-gray-200 bg-gray-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
                style={isSelected ? { borderColor: dg.color } : undefined}
                title={isSelected ? 'Click to show all days' : 'Click to zoom to this day'}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dg.color }}></div>
                <span>{customName ? `${customName}` : dg.label}</span>
                {customName && <span className="text-xs text-gray-400">{dg.label}</span>}
                <span className="text-xs text-gray-400">{dg.tracks.length}</span>
              </button>
              {isAdmin && onStartRenaming && (
                <button
                  onClick={() => onStartRenaming(dg.date)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Rename tour day"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                </button>
              )}
            </div>
          )
        })}

        {/* Show All button when a single day is selected */}
        {singleSelected && (
          <button
            onClick={() => onSelectDay('')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-gray-600"
          >
            Show all days
          </button>
        )}
      </div>
    </div>
  )
}
