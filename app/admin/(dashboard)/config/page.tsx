import {
	getSiteConfig,
	PromoBannerConfig,
	ContactInfoConfig,
	HomeHeroBannerConfig,
} from '@/lib/services/site-config-server'
import { getAdminDrops } from '@/lib/services/drops'
import { ConfigDashboard } from './config-dashboard'

export default async function ConfigPage() {
	const promoConfig =
		await getSiteConfig<PromoBannerConfig>('promo_banner')
	const contactConfig =
		await getSiteConfig<ContactInfoConfig>('contact_info')
	const heroBannerConfig = await getSiteConfig<HomeHeroBannerConfig>(
		'home_hero_banner',
	)
	const socialLinksConfig =
		await getSiteConfig<Record<string, unknown>>('social_links')
	const announcementBarConfig = await getSiteConfig<
		Record<string, unknown>
	>('announcement_bar')
	const storeSettingsConfig =
		await getSiteConfig<Record<string, unknown>>('store_settings')
	const drops = await getAdminDrops({
		page: 1,
		limit: 100,
		status: 'all',
	})
	const dropOptions = drops.items.map((drop) => ({
		id: drop.id,
		name: drop.name,
		status: drop.status,
		start_time: drop.start_time,
		end_time: drop.end_time,
	}))

	return (
		<ConfigDashboard
			promoConfig={promoConfig}
			contactConfig={contactConfig}
			heroBannerConfig={heroBannerConfig}
			socialLinksConfig={socialLinksConfig}
			announcementBarConfig={announcementBarConfig}
			storeSettingsConfig={storeSettingsConfig}
			dropOptions={dropOptions}
		/>
	)
}
