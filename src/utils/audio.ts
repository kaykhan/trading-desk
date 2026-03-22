function getAudioContextClass() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || null
}

function withAudioContext(run: (_context: AudioContext) => void) {
  const AudioContextClass = getAudioContextClass()

  if (!AudioContextClass) {
    return
  }

  try {
    const context = new AudioContextClass()
    run(context)

    window.setTimeout(() => {
      void context.close().catch(() => undefined)
    }, 1600)
  } catch {
    // Ignore audio failures so UI actions still complete.
  }
}

export function playMilestoneChime() {
  withAudioContext((context) => {
    const now = context.currentTime
    const masterGain = context.createGain()
    masterGain.gain.setValueAtTime(0.0001, now)
    masterGain.gain.exponentialRampToValueAtTime(0.08, now + 0.02)
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
    masterGain.connect(context.destination)

    const notes = [523.25, 659.25, 783.99]

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const startTime = now + index * 0.08
      const endTime = startTime + 0.45

      oscillator.type = index === notes.length - 1 ? 'triangle' : 'sine'
      oscillator.frequency.setValueAtTime(frequency, startTime)

      gain.gain.setValueAtTime(0.0001, startTime)
      gain.gain.exponentialRampToValueAtTime(index === notes.length - 1 ? 0.28 : 0.18, startTime + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime)

      oscillator.connect(gain)
      gain.connect(masterGain)
      oscillator.start(startTime)
      oscillator.stop(endTime)
    })
  })
}

export function playResearchUnlockChime() {
  withAudioContext((context) => {
    const now = context.currentTime
    const masterGain = context.createGain()
    masterGain.gain.setValueAtTime(0.0001, now)
    masterGain.gain.exponentialRampToValueAtTime(0.06, now + 0.02)
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9)
    masterGain.connect(context.destination)

    const notes = [392.0, 523.25, 659.25]

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const startTime = now + index * 0.07
      const endTime = startTime + 0.28

      oscillator.type = index === notes.length - 1 ? 'triangle' : 'square'
      oscillator.frequency.setValueAtTime(frequency, startTime)

      gain.gain.setValueAtTime(0.0001, startTime)
      gain.gain.exponentialRampToValueAtTime(index === notes.length - 1 ? 0.18 : 0.12, startTime + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime)

      oscillator.connect(gain)
      gain.connect(masterGain)
      oscillator.start(startTime)
      oscillator.stop(endTime)
    })
  })
}
