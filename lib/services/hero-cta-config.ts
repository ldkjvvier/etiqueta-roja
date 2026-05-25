import {
	HeroCTAConfig,
	HomeHeroBannerConfig,
} from '@/lib/data/site-config'
import {
	createDefaultHeroCTAConfig,
	parseHeroCTAConfig,
} from '@/lib/validation/hero-cta'

type HeroCTAInput =
	| Pick<Partial<HomeHeroBannerConfig>, 'cta'>
	| null
	| undefined

export function getHeroCTAConfig(
	config: HeroCTAInput,
): HeroCTAConfig {
	const legacy = {
		ctaText: config?.cta?.text,
		ctaLink: config?.cta?.link,
		buttonBgColor: config?.cta?.backgroundColor,
		buttonTextColor: config?.cta?.textColor,
	}

	const parsed = parseHeroCTAConfig(config?.cta, legacy)
	if (parsed.success) {
		return parsed.data
	}

	return createDefaultHeroCTAConfig(legacy)
}
