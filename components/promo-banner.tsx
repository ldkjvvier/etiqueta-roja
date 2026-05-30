import Link from 'next/link'
import {
	getSiteConfig,
	PromoBannerConfig,
} from '@/lib/data/site-config'

export async function PromoBanner() {
	const config =
		await getSiteConfig<PromoBannerConfig>('promo_banner')

	// If disabled or not found, don't show anything (or show default if desired, but request implies control)
	if (!config || !config.is_active) {
		return null
	}

	const { message, link } = config.value

	// Franja estática: una sola capa de comunicación animada por página
	// (el marquee vive en AnnouncementBar). Aquí, texto centrado fijo.
	const baseStyles =
		'text-sm font-bold tracking-widest flex items-center gap-2'

	const content = link ? (
		<Link
			href={link}
			className={`${baseStyles} hover:text-primary transition-colors cursor-pointer`}
		>
			{message}
		</Link>
	) : (
		<span className={baseStyles}>{message}</span>
	)

	return (
		<div className="bg-foreground text-background py-3 border-b border-foreground overflow-hidden">
			<div className="container mx-auto px-4 flex items-center justify-center text-center">
				{content}
			</div>
		</div>
	)
}
