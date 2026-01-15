import {
	getSiteConfig,
	PromoBannerConfig,
} from '@/lib/services/site-config-server'

export async function PromoBanner() {
	const config = await getSiteConfig<PromoBannerConfig>(
		'promo_banner'
	)

	// If disabled or not found, don't show anything (or show default if desired, but request implies control)
	if (!config || !config.is_active) {
		return null
	}

	const { message } = config.value

	return (
		<div className="bg-foreground text-background py-3 border-b border-foreground overflow-hidden flex select-none gap-0">
			<div className="flex animate-marquee-infinite whitespace-nowrap min-w-full shrink-0 items-center justify-around">
				{Array.from({ length: 8 }).map((_, i) => (
					<span
						key={i}
						className="mx-8 text-sm font-bold tracking-widest flex items-center gap-2"
					>
						{message}
					</span>
				))}
			</div>
			<div
				aria-hidden="true"
				className="flex animate-marquee-infinite whitespace-nowrap min-w-full shrink-0 items-center justify-around"
			>
				{Array.from({ length: 8 }).map((_, i) => (
					<span
						key={i}
						className="mx-8 text-sm font-bold tracking-widest flex items-center gap-2"
					>
						{message}
					</span>
				))}
			</div>
		</div>
	)
}
