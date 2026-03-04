'use client'

import { useEffect, useMemo, useState } from 'react'

function toCountdownParts(targetDate: string) {
	const endTime = new Date(targetDate).getTime()
	if (Number.isNaN(endTime)) {
		return null
	}

	const diff = Math.max(0, endTime - Date.now())
	const totalSeconds = Math.floor(diff / 1000)
	const days = Math.floor(totalSeconds / 86400)
	const hours = Math.floor((totalSeconds % 86400) / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	return { days, hours, minutes, seconds }
}

function pad(value: number) {
	return value.toString().padStart(2, '0')
}

export function HeroDropCountdown({
	targetDate,
}: {
	targetDate: string
}) {
	const [now, setNow] = useState(() => Date.now())

	useEffect(() => {
		const timer = window.setInterval(() => {
			setNow(Date.now())
		}, 1000)

		return () => window.clearInterval(timer)
	}, [])

	const countdown = useMemo(() => {
		void now
		return toCountdownParts(targetDate)
	}, [now, targetDate])

	if (!countdown) {
		return null
	}

	return (
		<p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground">
			{pad(countdown.days)}:{pad(countdown.hours)}:
			{pad(countdown.minutes)}:{pad(countdown.seconds)}
		</p>
	)
}
