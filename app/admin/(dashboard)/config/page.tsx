import {
	getSiteConfig,
	PromoBannerConfig,
	ContactInfoConfig,
	HomeHeroBannerConfig,
} from '@/lib/services/site-config-server'
import { getAdminDrops } from '@/lib/services/drops'
import {
	PromoBannerForm,
	ContactInfoForm,
	HomeHeroBannerForm,
} from './config-forms'

export default async function ConfigPage() {
	const promoConfig =
		await getSiteConfig<PromoBannerConfig>('promo_banner')
	const contactConfig =
		await getSiteConfig<ContactInfoConfig>('contact_info')
	const heroBannerConfig = await getSiteConfig<HomeHeroBannerConfig>(
		'home_hero_banner',
	)
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
		<div className="space-y-8">
			<h1 className="text-3xl font-bold">Configuración del Sitio</h1>

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
				<div className="xl:col-span-8">
					<HomeHeroBannerForm
						initialData={heroBannerConfig?.value}
						isActive={heroBannerConfig?.is_active}
						initialDescription={heroBannerConfig?.description}
						dropOptions={dropOptions}
					/>
				</div>
				<div className="space-y-6 xl:col-span-4">
					<PromoBannerForm
						initialData={promoConfig?.value}
						isActive={promoConfig?.is_active}
						initialDescription={promoConfig?.description}
					/>

					<ContactInfoForm
						initialData={contactConfig?.value}
						initialDescription={contactConfig?.description}
					/>
				</div>
			</div>
		</div>
	)
}
