import { useEffect } from 'react'
import { create } from 'zustand'

type TimeOfDay = 'morning' | 'sunset' | 'night'

const useTimeBasedSkyStore = create<{
  timeOfDay: TimeOfDay
  setTimeOfDay: (next: TimeOfDay) => void
}>((set) => ({
  timeOfDay: 'morning',
  setTimeOfDay: (next) => set({ timeOfDay: next }),
}))

export function TimeBasedSky() {
  const timeOfDay = useTimeBasedSkyStore((state) => state.timeOfDay)
  const setTimeOfDay = useTimeBasedSkyStore((state) => state.setTimeOfDay)

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours()

      if (hour >= 6 && hour < 17) {
        setTimeOfDay('morning')
      } else if (hour >= 17 && hour < 19) {
        setTimeOfDay('sunset')
      } else {
        setTimeOfDay('night')
      }
    }

    updateTimeOfDay()
    const interval = setInterval(updateTimeOfDay, 60000) // 1분마다 체크

    return () => clearInterval(interval)
  }, [])

  const skyConfig = {
    morning: {
      gradient: 'from-blue-400 via-blue-300 to-blue-100',
      sunMoon: (
        <div className="absolute top-8 right-12 w-16 h-16 bg-yellow-400 rounded-full shadow-lg shadow-yellow-300/50">
          <div className="absolute inset-2 bg-yellow-300 rounded-full opacity-50"></div>
        </div>
      ),
    },
    sunset: {
      gradient: 'from-orange-400 via-pink-400 to-purple-400',
      sunMoon: (
        <div className="absolute top-12 right-8 w-20 h-20 bg-orange-500 rounded-full shadow-lg shadow-orange-400/50">
          <div className="absolute inset-2 bg-orange-400 rounded-full opacity-50"></div>
        </div>
      ),
    },
    night: {
      gradient: 'from-indigo-900 via-indigo-800 to-indigo-700',
      sunMoon: (
        <>
          <div className="absolute top-8 right-12 w-14 h-14 bg-gray-100 rounded-full shadow-lg shadow-gray-300/30">
            <div className="absolute top-2 right-1 w-10 h-10 bg-indigo-900 rounded-full"></div>
          </div>
          {/* Stars */}
          <div className="absolute top-4 left-8 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-12 left-20 w-1 h-1 bg-white rounded-full animate-pulse delay-100"></div>
          <div className="absolute top-16 right-20 w-1 h-1 bg-white rounded-full animate-pulse delay-200"></div>
          <div className="absolute top-6 right-32 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        </>
      ),
    },
  }

  const config = skyConfig[timeOfDay]

  return null
}

interface CloudProps {
  delay: number
  duration: number
  top: string
  size: 'sm' | 'md' | 'lg'
}

function Cloud({ delay, duration, top, size }: CloudProps) {
  const sizeConfig = {
    sm: { width: 'w-16', height: 'h-8', circles: [8, 10, 8] },
    md: { width: 'w-20', height: 'h-10', circles: [10, 12, 10] },
    lg: { width: 'w-24', height: 'h-12', circles: [12, 14, 12] },
  }

  const config = sizeConfig[size]

  return (
    <div
      className="absolute animate-cloud-move opacity-70"
      style={{
        top,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <div className={`relative ${config.width} ${config.height}`}>
        <div
          className="absolute rounded-full bg-white/80"
          style={{
            left: '0%',
            bottom: '0%',
            width: `${config.circles[0] * 4}px`,
            height: `${config.circles[0] * 4}px`,
          }}
        ></div>
        <div
          className="absolute rounded-full bg-white/80"
          style={{
            left: '30%',
            bottom: '20%',
            width: `${config.circles[1] * 4}px`,
            height: `${config.circles[1] * 4}px`,
          }}
        ></div>
        <div
          className="absolute rounded-full bg-white/80"
          style={{
            left: '60%',
            bottom: '0%',
            width: `${config.circles[2] * 4}px`,
            height: `${config.circles[2] * 4}px`,
          }}
        ></div>
      </div>
    </div>
  )
}
