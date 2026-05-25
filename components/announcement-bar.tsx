import Link from 'next/link'
import { getSiteConfig } from '@/lib/data/site-config'

type AnnouncementBarConfig = {
	messages?: unknown
	message?: string
	ctaText?: string
	ctaLink?: string
	backgroundColor?: string
	textColor?: string
	speed?: number
}

function normalizeMessages(config: AnnouncementBarConfig): string[] {
	if (Array.isArray(config.messages)) {
		const list = config.messages
			.filter((item): item is string => typeof item === 'string')
			.map((item) => item.trim())
			.filter(Boolean)
		if (list.length > 0) return list
	}

	if (typeof config.message === 'string' && config.message.trim()) {
		return [config.message.trim()]
	}

	return []
}

function MarqueeItems({ messages }: { messages: string[] }) {
	return (
		<>
			{messages.map((message, index) => (
				<span
					key={`${message}-${index}`}
					className="inline-flex items-center"
				>
					{message}
					<span className="mx-4 opacity-50" aria-hidden="true">
						-
					</span>
				</span>
			))}
		</>
	)
}

export async function AnnouncementBar() {
	const configResponse = await getSiteConfig<AnnouncementBarConfig>(
		'announcement_bar',
	)

	if (!configResponse || !configResponse.is_active) {
		return null
	}

	const config = configResponse.value || {}
	const messages = normalizeMessages(config)

	if (messages.length === 0) {
		return null
	}

	const ctaText = config.ctaText?.trim() || ''
	const ctaLink = config.ctaLink?.trim() || ''
	const speed = Math.min(
		80,
		Math.max(
			12,
			Number.isFinite(config.speed) ? Number(config.speed) : 20,
		),
	)

	return (
		<section
			role="region"
			aria-label="Announcement"
			className="w-full border-b border-black/10"
			style={{
				backgroundColor: config.backgroundColor || '#111111',
				color: config.textColor || '#FFFFFF',
			}}
		>
			<div className="mx-auto flex w-full items-center gap-4 px-4 py-2.5 sm:px-6">
				<div className="group relative min-w-0 flex-1 overflow-hidden">
					<div
						className="flex w-max items-center whitespace-nowrap text-xs font-semibold tracking-[0.14em] uppercase sm:text-sm animate-announcement-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none"
						style={{
							animationDuration: `${speed}s`,
						}}
					>
						<div className="shrink-0 pr-8">
							<MarqueeItems messages={messages} />
						</div>
						<div className="shrink-0 pr-8" aria-hidden="true">
							<MarqueeItems messages={messages} />
						</div>
					</div>
				</div>

				{ctaText && ctaLink ? (
					<Link
						href={ctaLink}
						className="shrink-0 rounded border border-current/40 px-3 py-1 text-[10px] font-bold tracking-[0.14em] uppercase transition-colors hover:bg-white/10 sm:text-xs"
					>
						{ctaText}
					</Link>
				) : null}
			</div>
		</section>
	)
}
