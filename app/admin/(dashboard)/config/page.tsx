import {
	getSiteConfig,
	PromoBannerConfig,
	HomeHeroBannerConfig,
} from '@/lib/data/site-config'
import { getAdminSocialLinks } from '@/lib/data/social-links'
import { getStoreInfo } from '@/lib/data/store-info'
import { getAdminDrops } from '@/lib/data/drops'
import { ConfigDashboard } from './config-dashboard'

export default async function ConfigPage() {
	const promoConfig =
		await getSiteConfig<PromoBannerConfig>('promo_banner')
	const socialLinks = await getAdminSocialLinks()
	const storeInfo = await getStoreInfo()
	const heroBannerConfig = await getSiteConfig<HomeHeroBannerConfig>(
		'home_hero_banner',
	)
	const announcementBarConfig = await getSiteConfig<
		Record<string, unknown>
	>('announcement_bar')
	const storeSettingsConfig =
		await getSiteConfig<Record<string, unknown>>('store_settings')
	const { data: allDrops } = await getAdminDrops()
	const dropOptions = (allDrops ?? []).map((drop) => ({
		id: drop.id,
		name: drop.name,
		status: drop.status,
		start_time: drop.start_time,
		end_time: drop.end_time,
	}))

	return (
		<ConfigDashboard
			promoConfig={promoConfig}
			heroBannerConfig={heroBannerConfig}
			socialLinks={socialLinks}
			storeInfo={storeInfo}
			announcementBarConfig={announcementBarConfig}
			storeSettingsConfig={storeSettingsConfig}
			dropOptions={dropOptions}
		/>
	)
}
