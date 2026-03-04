'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type CountdownParts = {
	days: number
	hours: number
	minutes: number
	seconds: number
	totalMs: number
}

function toTime(targetDate: string | Date): CountdownParts {
	const target =
		targetDate instanceof Date
			? targetDate.getTime()
			: new Date(targetDate).getTime()

	if (Number.isNaN(target)) {
		return {
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			totalMs: 0,
		}
	}

	const totalMs = Math.max(0, target - Date.now())
	const totalSeconds = Math.floor(totalMs / 1000)

	const days = Math.floor(totalSeconds / 86400)
	const hours = Math.floor((totalSeconds % 86400) / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	return { days, hours, minutes, seconds, totalMs }
}

function pad(value: number) {
	return value.toString().padStart(2, '0')
}

function Unit({
	value,
	label,
	bgColor,
	textColor,
}: {
	value: string
	label: 'DD' | 'HH' | 'MM' | 'SS'
	bgColor: string
	textColor: string
}) {
	return (
		<div
			className="min-w-14.5 rounded-md border border-white/20 px-2 py-2 text-center backdrop-blur-sm"
			style={{ backgroundColor: bgColor }}
		>
			<p
				className="font-mono text-xl font-black tracking-widest md:text-2xl"
				style={{ color: textColor }}
			>
				{value}
			</p>
			<p
				className="mt-1 text-[10px] font-semibold tracking-[0.22em]"
				style={{ color: textColor }}
			>
				{label}
			</p>
		</div>
	)
}

export function HeroDropCountdown({
	targetDate,
	containerBgColor = 'rgba(24, 24, 27, 0.45)',
	unitBgColor = 'rgba(0, 0, 0, 0.35)',
	textColor = '#FFFFFF',
}: {
	targetDate: string | Date
	containerBgColor?: string
	unitBgColor?: string
	textColor?: string
}) {
	const router = useRouter()
	const didRefresh = useRef(false)
	const [isMounted, setIsMounted] = useState(false)
	const [tick, setTick] = useState(0)

	const time = useMemo(() => {
		void tick
		return toTime(targetDate)
	}, [targetDate, tick])

	useEffect(() => {
		setIsMounted(true)
	}, [])

	useEffect(() => {
		if (!isMounted) {
			return
		}

		if (time.totalMs <= 0) {
			if (!didRefresh.current) {
				didRefresh.current = true
				router.refresh()
			}
			return
		}

		const intervalId = window.setInterval(() => {
			setTick((prev) => prev + 1)
		}, 1000)

		return () => window.clearInterval(intervalId)
	}, [isMounted, router, time.totalMs])

	if (!isMounted || time.totalMs <= 0) {
		return null
	}

	return (
		<div
			className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/15 p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
			style={{ backgroundColor: containerBgColor }}
		>
			<Unit
				value={pad(time.days)}
				label="DD"
				bgColor={unitBgColor}
				textColor={textColor}
			/>
			<Unit
				value={pad(time.hours)}
				label="HH"
				bgColor={unitBgColor}
				textColor={textColor}
			/>
			<Unit
				value={pad(time.minutes)}
				label="MM"
				bgColor={unitBgColor}
				textColor={textColor}
			/>
			<Unit
				value={pad(time.seconds)}
				label="SS"
				bgColor={unitBgColor}
				textColor={textColor}
			/>
		</div>
	)
}
