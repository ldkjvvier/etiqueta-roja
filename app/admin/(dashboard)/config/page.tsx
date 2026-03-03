import {
	getSiteConfig,
	PromoBannerConfig,
	ContactInfoConfig,
} from '@/lib/services/site-config-server'
import { PromoBannerForm, ContactInfoForm } from './config-forms'

export default async function ConfigPage() {
	const promoConfig =
		await getSiteConfig<PromoBannerConfig>('promo_banner')
	const contactConfig =
		await getSiteConfig<ContactInfoConfig>('contact_info')

	return (
		<div className="max-w-4xl space-y-8">
			<h1 className="text-3xl font-bold">Configuración del Sitio</h1>

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
	)
}
