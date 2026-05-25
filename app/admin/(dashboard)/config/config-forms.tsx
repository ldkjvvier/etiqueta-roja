'use client'

import {
	useActionState,
	useMemo,
	useState,
	useTransition,
} from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
	updatePromoBanner,
	updateContactInfo,
	updateSocialLinksConfig,
	updateAnnouncementBarConfig,
	updateStoreSettingsConfig,
} from '@/lib/actions/site-config'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
	PromoBannerConfig,
	ContactInfoConfig,
	HomeHeroBannerConfig,
} from '@/lib/data/site-config'
import { HeroStudio } from '@/components/hero-studio/HeroStudio'
import { HeroDropOption } from '@/types/heroStudio.types'
import {
	isSupportedStoreCurrency,
	isSupportedStoreTimezone,
	STORE_SETTINGS_CURRENCY,
	STORE_SETTINGS_TIMEZONE,
	storeSettingsEditableFieldsSchema,
} from '@/lib/validation/store-settings'
import {
	ConfigColorPicker,
	ConfigInputField,
	ConfigPreview,
	ConfigSectionCard,
	ConfigToggle,
} from './config-ui'

const initialState = { message: '', error: false }

export function HomeHeroBannerForm({
	initialData,
	isActive,
	initialDescription,
	dropOptions,
}: {
	initialData?: HomeHeroBannerConfig
	isActive?: boolean
	initialDescription?: string | null
	dropOptions?: HeroDropOption[]
}) {
	return (
		<HeroStudio
			initialData={initialData}
			isActive={isActive}
			initialDescription={initialDescription}
			dropOptions={dropOptions}
		/>
	)
}

export function PromoBannerForm({
	initialData,
	isActive,
	initialDescription,
}: {
	initialData?: PromoBannerConfig
	isActive?: boolean
	initialDescription?: string | null
}) {
	const [state, formAction, isPending] = useActionState(
		updatePromoBanner,
		initialState,
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Banner Promocional</CardTitle>
				<CardDescription>
					Gestiona el mensaje que aparece arriba del todo.
				</CardDescription>
			</CardHeader>
			<form action={formAction}>
				<CardContent className="space-y-4">
					<div className="flex items-center space-x-2">
						<Switch
							id="is_active"
							name="is_active"
							defaultChecked={isActive ?? true}
						/>
						<Label htmlFor="is_active">Mostrar Banner</Label>
					</div>

					<div className="space-y-2">
						<Label htmlFor="message">Mensaje</Label>
						<Input
							id="message"
							name="message"
							defaultValue={initialData?.message ?? ''}
							placeholder="Ej: Envio gratis en compras mayores a $50"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="link">Enlace (Opcional)</Label>
						<Input
							id="link"
							name="link"
							defaultValue={initialData?.link ?? ''}
							placeholder="Ej: /producto/oferta"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Descripción interna</Label>
						<Input
							id="description"
							name="description"
							defaultValue={initialDescription ?? ''}
							placeholder="Ayuda interna para admins"
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Guardando...' : 'Guardar Cambios'}
					</Button>
					{state.message && (
						<p
							className={`ml-4 text-sm ${
								state.error ? 'text-destructive' : 'text-green-600'
							}`}
						>
							{state.message}
						</p>
					)}
				</CardFooter>
			</form>
		</Card>
	)
}

export function ContactInfoForm({
	initialData,
	initialDescription,
}: {
	initialData?: ContactInfoConfig
	initialDescription?: string | null
}) {
	const [state, formAction, isPending] = useActionState(
		updateContactInfo,
		initialState,
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Información de Contacto</CardTitle>
				<CardDescription>
					Actualiza los enlaces a redes sociales y contacto.
				</CardDescription>
			</CardHeader>
			<form action={formAction}>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="whatsapp">WhatsApp</Label>
							<Input
								id="whatsapp"
								name="whatsapp"
								defaultValue={initialData?.whatsapp ?? ''}
								placeholder="Numero completo"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="instagram">Instagram</Label>
							<Input
								id="instagram"
								name="instagram"
								defaultValue={initialData?.instagram ?? ''}
								placeholder="@usuario"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="tiktok">TikTok</Label>
							<Input
								id="tiktok"
								name="tiktok"
								defaultValue={initialData?.tiktok ?? ''}
								placeholder="@usuario"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								defaultValue={initialData?.email ?? ''}
								placeholder="contacto@ejemplo.com"
							/>
						</div>
						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="description">Descripción interna</Label>
							<Input
								id="description"
								name="description"
								defaultValue={initialDescription ?? ''}
								placeholder="Contexto interno del bloque"
							/>
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Guardando...' : 'Guardar Cambios'}
					</Button>
					{state.message && (
						<p
							className={`ml-4 text-sm ${
								state.error ? 'text-destructive' : 'text-green-600'
							}`}
						>
							{state.message}
						</p>
					)}
				</CardFooter>
			</form>
		</Card>
	)
}

const optionalUrlSchema = z
	.string()
	.trim()
	.refine(
		(value) => {
			if (!value) return true
			try {
				const parsed = new URL(value)
				return (
					parsed.protocol === 'https:' || parsed.protocol === 'http:'
				)
			} catch {
				return false
			}
		},
		{ message: 'Ingresa una URL válida' },
	)

const socialLinksFormSchema = z.object({
	isActive: z.boolean(),
	description: z.string().max(160).optional(),
	instagram: optionalUrlSchema,
	tiktok: optionalUrlSchema,
	twitter: optionalUrlSchema,
	facebook: optionalUrlSchema,
})

const announcementBarFormSchema = z.object({
	isActive: z.boolean(),
	description: z.string().max(160).optional(),
	message: z.string().trim().min(1).max(140),
	ctaText: z.string().trim().max(40),
	ctaLink: z.string().trim().max(2048),
	backgroundColor: z
		.string()
		.regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Color inválido'),
	textColor: z
		.string()
		.regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Color inválido'),
})

const storeSettingsFormSchema = z
	.object({
		isActive: z.boolean(),
		description: z.string().max(160).optional(),
	})
	.extend(storeSettingsEditableFieldsSchema.shape)

function useConfigSubmit() {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const submit = (
		action: (
			_prevState: unknown,
			formData: FormData,
		) => Promise<{ message: string; error: boolean }>,
		formData: FormData,
	) => {
		startTransition(async () => {
			const result = await action(null, formData)
			if (result.error) {
				toast.error(result.message)
				return
			}
			toast.success(result.message)
			router.refresh()
		})
	}

	return { isPending, submit }
}

export function SocialLinksConfigForm({
	initialData,
	isActive,
	initialDescription,
}: {
	initialData?: Record<string, unknown> | null
	isActive?: boolean
	initialDescription?: string | null
}) {
	const { isPending, submit } = useConfigSubmit()
	const form = useForm<z.infer<typeof socialLinksFormSchema>>({
		resolver: zodResolver(socialLinksFormSchema),
		defaultValues: {
			isActive: isActive ?? true,
			description: initialDescription ?? '',
			instagram: String(initialData?.instagram || ''),
			tiktok: String(initialData?.tiktok || ''),
			twitter: String(initialData?.twitter || ''),
			facebook: String(initialData?.facebook || ''),
		},
	})

	const values = form.watch()

	const onSubmit = form.handleSubmit((data) => {
		const fd = new FormData()
		fd.set('is_active', data.isActive ? 'true' : 'false')
		fd.set('description', data.description || '')
		fd.set('instagram', data.instagram || '')
		fd.set('tiktok', data.tiktok || '')
		fd.set('twitter', data.twitter || '')
		fd.set('facebook', data.facebook || '')
		submit(updateSocialLinksConfig, fd)
	})

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<ConfigSectionCard
				title="Redes sociales"
				description="Enlaces de redes sociales visibles en la tienda."
				footer={
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Guardando...' : 'Guardar Redes'}
					</Button>
				}
			>
				<ConfigToggle
					id="social_links_active"
					label="Sección activa"
					help="Oculta o muestra la sección de redes sociales."
					checked={values.isActive}
					onCheckedChange={(checked) =>
						form.setValue('isActive', checked)
					}
				/>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<ConfigInputField id="instagram" label="URL de Instagram">
						<Input id="instagram" {...form.register('instagram')} />
					</ConfigInputField>
					<ConfigInputField id="tiktok" label="URL de TikTok">
						<Input id="tiktok" {...form.register('tiktok')} />
					</ConfigInputField>
					<ConfigInputField id="twitter" label="URL de Twitter/X">
						<Input id="twitter" {...form.register('twitter')} />
					</ConfigInputField>
					<ConfigInputField id="facebook" label="URL de Facebook">
						<Input id="facebook" {...form.register('facebook')} />
					</ConfigInputField>
				</div>

				<ConfigInputField
					id="social_description"
					label="Descripción interna"
				>
					<Input
						id="social_description"
						{...form.register('description')}
					/>
				</ConfigInputField>

				<ConfigPreview title="Vista previa de enlaces activos">
					<div className="flex flex-wrap gap-2 text-sm">
						{[
							['Instagram', values.instagram],
							['TikTok', values.tiktok],
							['Twitter/X', values.twitter],
							['Facebook', values.facebook],
						]
							.filter(([, url]) => Boolean(url))
							.map(([label]) => (
								<span
									key={label}
									className="rounded border px-2 py-1"
								>
									{label}
								</span>
							))}
					</div>
				</ConfigPreview>
			</ConfigSectionCard>
		</form>
	)
}

export function AnnouncementBarConfigForm({
	initialData,
	isActive,
	initialDescription,
}: {
	initialData?: Record<string, unknown> | null
	isActive?: boolean
	initialDescription?: string | null
}) {
	const { isPending, submit } = useConfigSubmit()
	const form = useForm<z.infer<typeof announcementBarFormSchema>>({
		resolver: zodResolver(announcementBarFormSchema),
		defaultValues: {
			isActive: isActive ?? true,
			description: initialDescription ?? '',
			message: String(initialData?.message || ''),
			ctaText: String(initialData?.ctaText || ''),
			ctaLink: String(initialData?.ctaLink || ''),
			backgroundColor: String(
				initialData?.backgroundColor || '#111111',
			),
			textColor: String(initialData?.textColor || '#FFFFFF'),
		},
	})

	const values = form.watch()

	const onSubmit = form.handleSubmit((data) => {
		const fd = new FormData()
		fd.set('is_active', data.isActive ? 'true' : 'false')
		fd.set('description', data.description || '')
		fd.set('message', data.message)
		fd.set('cta_text', data.ctaText)
		fd.set('cta_link', data.ctaLink)
		fd.set('background_color', data.backgroundColor)
		fd.set('text_color', data.textColor)
		submit(updateAnnouncementBarConfig, fd)
	})

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<ConfigSectionCard
				title="Barra de anuncios"
				description="Barra superior destacada para anuncios y CTA."
				footer={
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Guardando...' : 'Guardar barra'}
					</Button>
				}
			>
				<ConfigToggle
					id="announcement_active"
					label="Barra de anuncios activa"
					checked={values.isActive}
					onCheckedChange={(checked) =>
						form.setValue('isActive', checked)
					}
				/>

				<ConfigInputField id="announcement_message" label="Mensaje">
					<Input
						id="announcement_message"
						{...form.register('message')}
					/>
				</ConfigInputField>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<ConfigInputField
						id="announcement_cta_text"
						label="Texto CTA"
					>
						<Input
							id="announcement_cta_text"
							{...form.register('ctaText')}
						/>
					</ConfigInputField>
					<ConfigInputField
						id="announcement_cta_link"
						label="Enlace CTA"
					>
						<Input
							id="announcement_cta_link"
							{...form.register('ctaLink')}
						/>
					</ConfigInputField>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<ConfigColorPicker
						id="announcement_bg_color"
						label="Color de fondo"
						value={values.backgroundColor}
						onChange={(next) =>
							form.setValue('backgroundColor', next)
						}
					/>
					<ConfigColorPicker
						id="announcement_text_color"
						label="Color del texto"
						value={values.textColor}
						onChange={(next) => form.setValue('textColor', next)}
					/>
				</div>

				<ConfigInputField
					id="announcement_description"
					label="Descripción interna"
				>
					<Input
						id="announcement_description"
						{...form.register('description')}
					/>
				</ConfigInputField>

				<ConfigPreview title="Vista previa de barra">
					<div
						className="flex items-center justify-between rounded px-3 py-2 text-sm"
						style={{
							backgroundColor: values.backgroundColor,
							color: values.textColor,
						}}
					>
						<span>{values.message || 'Tu mensaje aquí'}</span>
						{values.ctaText ? <span>{values.ctaText}</span> : null}
					</div>
				</ConfigPreview>
			</ConfigSectionCard>
		</form>
	)
}

export function StoreSettingsConfigForm({
	initialData,
	isActive,
	initialDescription,
}: {
	initialData?: Record<string, unknown> | null
	isActive?: boolean
	initialDescription?: string | null
}) {
	const { isPending, submit } = useConfigSubmit()
	const storedCurrency = String(
		initialData?.currency || STORE_SETTINGS_CURRENCY,
	)
	const storedTimezone = String(
		initialData?.timezone || STORE_SETTINGS_TIMEZONE,
	)
	const hasLegacyCurrency = !isSupportedStoreCurrency(storedCurrency)
	const hasLegacyTimezone = !isSupportedStoreTimezone(storedTimezone)
	const form = useForm<z.infer<typeof storeSettingsFormSchema>>({
		resolver: zodResolver(storeSettingsFormSchema),
		defaultValues: {
			isActive: isActive ?? true,
			description: initialDescription ?? '',
			storeName: String(initialData?.storeName || ''),
			supportEmail: String(initialData?.supportEmail || ''),
		},
	})

	const values = form.watch()

	const onSubmit = form.handleSubmit((data) => {
		const fd = new FormData()
		fd.set('is_active', data.isActive ? 'true' : 'false')
		fd.set('description', data.description || '')
		fd.set('store_name', data.storeName)
		fd.set('support_email', data.supportEmail)
		fd.set('currency', STORE_SETTINGS_CURRENCY)
		fd.set('timezone', STORE_SETTINGS_TIMEZONE)
		submit(updateStoreSettingsConfig, fd)
	})

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<ConfigSectionCard
				title="Ajustes de tienda"
				description="Ajustes internos de referencia y soporte. La moneda y la zona horaria operativas están fijadas por el negocio."
				footer={
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Guardando...' : 'Guardar ajustes'}
					</Button>
				}
			>
				<ConfigToggle
					id="store_settings_active"
					label="Ajustes de tienda activos"
					checked={values.isActive}
					onCheckedChange={(checked) =>
						form.setValue('isActive', checked)
					}
				/>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<ConfigInputField
						id="store_name"
						label="Nombre interno de la tienda"
						helper="Referencia interna para admins. No cambia el nombre visible, el logo ni la identidad pública de la tienda."
					>
						<Input id="store_name" {...form.register('storeName')} />
					</ConfigInputField>
					<ConfigInputField
						id="support_email"
						label="Correo interno de soporte"
						helper="El correo visible en la tienda se gestiona en Contacto. Este campo queda como referencia operativa interna."
					>
						<Input
							id="support_email"
							type="email"
							{...form.register('supportEmail')}
						/>
					</ConfigInputField>
					<ConfigInputField
						id="currency"
						label="Moneda"
						helper={
							hasLegacyCurrency
								? `Valor legado detectado (${storedCurrency}). Al guardar se normalizará a ${STORE_SETTINGS_CURRENCY}.`
								: 'Fijada en CLP. La tienda y el sistema de precios actual no soportan cambio de moneda desde este panel.'
						}
					>
						<Input
							id="currency"
							value={storedCurrency}
							readOnly
							aria-readonly="true"
							className="bg-muted/40 text-muted-foreground"
						/>
					</ConfigInputField>
					<ConfigInputField
						id="timezone"
						label="Zona horaria"
						helper={
							hasLegacyTimezone
								? `Valor legado detectado (${storedTimezone}). Al guardar se normalizará a ${STORE_SETTINGS_TIMEZONE}.`
								: 'Fijada en America/Santiago. La programación vigente no admite una zona horaria editable en este panel.'
						}
					>
						<Input
							id="timezone"
							value={storedTimezone}
							readOnly
							aria-readonly="true"
							className="bg-muted/40 text-muted-foreground"
						/>
					</ConfigInputField>
				</div>

				<ConfigInputField
					id="store_settings_description"
					label="Descripción interna"
				>
					<Input
						id="store_settings_description"
						{...form.register('description')}
					/>
				</ConfigInputField>

				<ConfigPreview title="Vista previa del resumen de tienda">
					<div className="space-y-1 text-sm">
						<p>
							<strong>Tienda:</strong> {values.storeName}
						</p>
						<p>
							<strong>Email soporte:</strong> {values.supportEmail}
						</p>
						<p>
							<strong>Moneda:</strong>{' '}
							{hasLegacyCurrency
								? `${storedCurrency} -> ${STORE_SETTINGS_CURRENCY} al guardar`
								: STORE_SETTINGS_CURRENCY}
						</p>
						<p>
							<strong>Zona horaria:</strong>{' '}
							{hasLegacyTimezone
								? `${storedTimezone} -> ${STORE_SETTINGS_TIMEZONE} al guardar`
								: STORE_SETTINGS_TIMEZONE}
						</p>
					</div>
				</ConfigPreview>
			</ConfigSectionCard>
		</form>
	)
}
