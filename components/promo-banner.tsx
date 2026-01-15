import {
	getSiteConfig,
	PromoBannerConfig,
} from '@/lib/services/site-config-server'
import { MessageCircle } from 'lucide-react'

export async function PromoBanner() {
	const config = await getSiteConfig<PromoBannerConfig>(
		'promo_banner'
	)

	// If disabled or not found, don't show anything (or show default if desired, but request implies control)
	if (!config || !config.is_active) {
		return null
	}

	const { message, show_whatsapp_icon } = config.value

	return (
		<div className="bg-foreground text-background py-3 border-b border-foreground overflow-hidden">
			<div className="flex animate-marquee whitespace-nowrap">
				{Array.from({ length: 8 }).map((_, i) => (
					<span
						key={i}
						className="mx-8 text-sm font-bold tracking-widest flex items-center gap-2"
					>
						{show_whatsapp_icon && (
							<MessageCircle className="w-4 h-4 fill-green-500 text-green-500" />
						)}
						{message}
					</span>
				))}
			</div>
		</div>
	)
}
