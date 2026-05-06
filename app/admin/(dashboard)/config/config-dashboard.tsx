'use client'

import { useMemo, useState } from 'react'
import type {
	ContactInfoConfig,
	HomeHeroBannerConfig,
	PromoBannerConfig,
} from '@/lib/services/site-config-server'
import type { HeroDropOption } from '@/types/heroStudio.types'
import {
	ContactInfoForm,
	HomeHeroBannerForm,
	PromoBannerForm,
	SocialLinksConfigForm,
	AnnouncementBarConfigForm,
	StoreSettingsConfigForm,
} from './config-forms'
import { cn } from '@/lib/utils'

type ConfigItemId =
	| 'store_settings'
	| 'contact_info'
	| 'home_hero_banner'
	| 'announcement_bar'
	| 'promo_banner'
	| 'social_links'

const NAV_SECTIONS: Array<{
	category: 'GENERAL' | 'INICIO' | 'PROMOCIÓN'
	items: Array<{ id: ConfigItemId; label: string }>
}> = [
	{
		category: 'GENERAL',
		items: [
			{ id: 'store_settings', label: 'Ajustes de tienda' },
			{ id: 'contact_info', label: 'Contacto' },
		],
	},
	{
		category: 'INICIO',
		items: [
			{ id: 'home_hero_banner', label: 'Hero principal' },
			{ id: 'announcement_bar', label: 'Barra de anuncios' },
			{ id: 'promo_banner', label: 'Banner promocional' },
		],
	},
	{
		category: 'PROMOCIÓN',
		items: [{ id: 'social_links', label: 'Redes sociales' }],
	},
]

type SiteConfigRecord = {
	value: Record<string, unknown> | null
	is_active?: boolean
	description?: string | null
}

export function ConfigDashboard({
	promoConfig,
	contactConfig,
	heroBannerConfig,
	socialLinksConfig,
	announcementBarConfig,
	storeSettingsConfig,
	dropOptions,
}: {
	promoConfig: {
		value?: PromoBannerConfig
		is_active?: boolean
		description?: string | null
	} | null
	contactConfig: {
		value?: ContactInfoConfig
		description?: string | null
	} | null
	heroBannerConfig: {
		value?: HomeHeroBannerConfig
		is_active?: boolean
		description?: string | null
	} | null
	socialLinksConfig: SiteConfigRecord | null
	announcementBarConfig: SiteConfigRecord | null
	storeSettingsConfig: SiteConfigRecord | null
	dropOptions: HeroDropOption[]
}) {
	const [activeItem, setActiveItem] =
		useState<ConfigItemId>('store_settings')

	const flatItems = useMemo(
		() => NAV_SECTIONS.flatMap((section) => section.items),
		[],
	)

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">Configuración del sitio</h1>

			<div className="md:hidden">
				<div className="overflow-x-auto rounded-lg border bg-muted/20 p-2">
					<div className="flex min-w-max gap-2">
						{flatItems.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => setActiveItem(item.id)}
								className={cn(
									'rounded-md px-3 py-2 text-sm font-medium transition-colors',
									activeItem === item.id
										? 'bg-primary text-primary-foreground'
										: 'hover:bg-background',
								)}
								aria-pressed={activeItem === item.id}
							>
								{item.label}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-12">
				<aside className="hidden md:block md:col-span-3">
					<nav className="sticky top-6 rounded-lg border bg-card p-3">
						{NAV_SECTIONS.map((section) => (
							<div key={section.category} className="mb-4 last:mb-0">
								<p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									{section.category}
								</p>
								<div className="space-y-1">
									{section.items.map((item) => (
										<button
											key={item.id}
											type="button"
											onClick={() => setActiveItem(item.id)}
											className={cn(
												'w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors',
												activeItem === item.id
													? 'bg-primary text-primary-foreground'
													: 'hover:bg-muted',
											)}
											aria-pressed={activeItem === item.id}
										>
											{item.label}
										</button>
									))}
								</div>
							</div>
						))}
					</nav>
				</aside>

				<section className="md:col-span-9 space-y-6">
					{activeItem === 'store_settings' && (
						<StoreSettingsConfigForm
							initialData={storeSettingsConfig?.value || null}
							isActive={storeSettingsConfig?.is_active}
							initialDescription={
								storeSettingsConfig?.description || ''
							}
						/>
					)}

					{activeItem === 'contact_info' && (
						<ContactInfoForm
							initialData={contactConfig?.value}
							initialDescription={contactConfig?.description}
						/>
					)}

					{activeItem === 'home_hero_banner' && (
						<HomeHeroBannerForm
							initialData={heroBannerConfig?.value}
							isActive={heroBannerConfig?.is_active}
							initialDescription={heroBannerConfig?.description}
							dropOptions={dropOptions}
						/>
					)}

					{activeItem === 'announcement_bar' && (
						<AnnouncementBarConfigForm
							initialData={announcementBarConfig?.value || null}
							isActive={announcementBarConfig?.is_active}
							initialDescription={
								announcementBarConfig?.description || ''
							}
						/>
					)}

					{activeItem === 'promo_banner' && (
						<PromoBannerForm
							initialData={promoConfig?.value}
							isActive={promoConfig?.is_active}
							initialDescription={promoConfig?.description}
						/>
					)}

					{activeItem === 'social_links' && (
						<SocialLinksConfigForm
							initialData={socialLinksConfig?.value || null}
							isActive={socialLinksConfig?.is_active}
							initialDescription={
								socialLinksConfig?.description || ''
							}
						/>
					)}
				</section>
			</div>
		</div>
	)
}
