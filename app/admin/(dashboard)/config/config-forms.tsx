'use client'

import { useActionState, useMemo, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
	updatePromoBanner,
	updateAnnouncementBarConfig,
} from '@/lib/actions/site-config'
import { updateStoreSocialLinks } from '@/lib/actions/social-links'
import { updateStoreInfo } from '@/lib/actions/store-info'
import type { AdminSocialLink } from '@/lib/data/social-links'
import type { StoreInfo } from '@/lib/data/store-info'
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
	HomeHeroBannerConfig,
} from '@/lib/data/site-config'
import { HeroStudio } from '@/components/hero-studio/HeroStudio'
import { HeroDropOption } from '@/types/heroStudio.types'
import {
	STORE_SETTINGS_CURRENCY,
	STORE_SETTINGS_TIMEZONE,
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
	dropOptions,
}: {
	initialData?: HomeHeroBannerConfig
	isActive?: boolean
	dropOptions?: HeroDropOption[]
}) {
	return (
		<HeroStudio
			initialData={initialData}
			isActive={isActive}
			dropOptions={dropOptions}
		/>
	)
}

export function PromoBannerForm({
	initialData,
	isActive,
}: {
	initialData?: PromoBannerConfig
	isActive?: boolean
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

const optionalEmailSchema = z
	.string()
	.trim()
	.refine((value) => !value || z.string().email().safeParse(value).success, {
		message: 'Ingresa un email válido',
	})

const optionalPhoneSchema = z
	.string()
	.trim()
	.refine((value) => !value || /^\+?[0-9\s-]{6,20}$/.test(value), {
		message: 'Ingresa un teléfono válido',
	})

const socialContactFormSchema = z.object({
	instagram: optionalUrlSchema,
	twitter: optionalUrlSchema,
	facebook: optionalUrlSchema,
	tiktok: optionalUrlSchema,
	whatsapp: optionalPhoneSchema,
	email: optionalEmailSchema,
})

const announcementBarFormSchema = z.object({
	isActive: z.boolean(),
	message: z.string().trim().min(1).max(140),
	backgroundColor: z
		.string()
		.regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Color inválido'),
	textColor: z
		.string()
		.regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Color inválido'),
})

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

export function SocialContactForm({
	socialLinks,
}: {
	socialLinks: AdminSocialLink[]
}) {
	const { isPending, submit } = useConfigSubmit()
	const initial = useMemo(() => {
		const map: Record<string, string> = {}
		for (const link of socialLinks) {
			map[link.platform] = link.value
		}
		return map
	}, [socialLinks])

	const form = useForm<z.infer<typeof socialContactFormSchema>>({
		resolver: zodResolver(socialContactFormSchema),
		defaultValues: {
			instagram: initial.instagram || '',
			twitter: initial.twitter || '',
			facebook: initial.facebook || '',
			tiktok: initial.tiktok || '',
			whatsapp: initial.whatsapp || '',
			email: initial.email || '',
		},
	})

	const values = form.watch()

	const onSubmit = form.handleSubmit((data) => {
		const fd = new FormData()
		fd.set('instagram', data.instagram || '')
		fd.set('twitter', data.twitter || '')
		fd.set('facebook', data.facebook || '')
		fd.set('tiktok', data.tiktok || '')
		fd.set('whatsapp', data.whatsapp || '')
		fd.set('email', data.email || '')
		submit(updateStoreSocialLinks, fd)
	})

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<ConfigSectionCard
				title="Redes y contacto"
				description="Enlaces de redes sociales y datos de contacto visibles en la tienda."
				footer={
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Guardando...' : 'Guardar cambios'}
					</Button>
				}
			>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<ConfigInputField id="instagram" label="URL de Instagram">
						<Input
							id="instagram"
							placeholder="https://instagram.com/tu-tienda"
							{...form.register('instagram')}
						/>
					</ConfigInputField>
					<ConfigInputField id="twitter" label="URL de Twitter/X">
						<Input
							id="twitter"
							placeholder="https://x.com/tu-tienda"
							{...form.register('twitter')}
						/>
					</ConfigInputField>
					<ConfigInputField id="facebook" label="URL de Facebook">
						<Input
							id="facebook"
							placeholder="https://facebook.com/tu-tienda"
							{...form.register('facebook')}
						/>
					</ConfigInputField>
					<ConfigInputField id="tiktok" label="URL de TikTok">
						<Input
							id="tiktok"
							placeholder="https://tiktok.com/@tu-tienda"
							{...form.register('tiktok')}
						/>
					</ConfigInputField>
					<ConfigInputField id="whatsapp" label="WhatsApp">
						<Input
							id="whatsapp"
							placeholder="+56 9 1234 5678"
							{...form.register('whatsapp')}
						/>
					</ConfigInputField>
					<ConfigInputField id="email" label="Email de contacto">
						<Input
							id="email"
							type="email"
							placeholder="contacto@ejemplo.com"
							{...form.register('email')}
						/>
					</ConfigInputField>
				</div>

				<ConfigPreview title="Vista previa de enlaces activos">
					<div className="flex flex-wrap gap-2 text-sm">
						{[
							['Instagram', values.instagram],
							['Twitter/X', values.twitter],
							['Facebook', values.facebook],
							['TikTok', values.tiktok],
							['WhatsApp', values.whatsapp],
							['Email', values.email],
						]
							.filter(([, value]) => Boolean(value))
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

const MIN_FOUNDED_YEAR = 1900

const storeInfoFormSchema = z.object({
	name: z.string().trim().min(1, 'El nombre es obligatorio').max(80),
	foundedYear: z
		.number({ invalid_type_error: 'El año debe ser un número' })
		.int()
		.min(MIN_FOUNDED_YEAR, `El año debe ser ${MIN_FOUNDED_YEAR} o posterior`)
		.refine((y) => y <= new Date().getFullYear(), {
			message: 'El año no puede ser futuro',
		}),
	tagline: z.string().trim().max(120).optional(),
	description: z.string().trim().max(300).optional(),
	address: z.string().trim().max(200).optional(),
	rut: z.string().trim().max(20).optional(),
})

export function StoreInfoForm({ storeInfo }: { storeInfo: StoreInfo }) {
	const { isPending, submit } = useConfigSubmit()
	const currentYear = new Date().getFullYear()
	const form = useForm<z.infer<typeof storeInfoFormSchema>>({
		resolver: zodResolver(storeInfoFormSchema),
		defaultValues: {
			name: storeInfo.name,
			foundedYear: storeInfo.founded_year ?? currentYear,
			tagline: storeInfo.tagline ?? '',
			description: storeInfo.description ?? '',
			address: storeInfo.address ?? '',
			rut: storeInfo.rut ?? '',
		},
	})

	const values = form.watch()

	const onSubmit = form.handleSubmit((data) => {
		const fd = new FormData()
		fd.set('name', data.name)
		fd.set('founded_year', String(data.foundedYear))
		fd.set('tagline', data.tagline || '')
		fd.set('description', data.description || '')
		fd.set('address', data.address || '')
		fd.set('rut', data.rut || '')
		submit(updateStoreInfo, fd)
	})

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<ConfigSectionCard
				title="Identidad de la tienda (SEO)"
				description="Controla cómo aparece la tienda en buscadores. El nombre solo afecta el título SEO y el copyright del footer."
				footer={
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Guardando...' : 'Guardar SEO'}
					</Button>
				}
			>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<ConfigInputField
						id="store_name"
						label="Nombre de la tienda"
						helper="Solo afecta SEO y el copyright del footer. No cambia el logo."
					>
						<Input
							id="store_name"
							placeholder="Etiqueta Roja"
							{...form.register('name')}
						/>
						{form.formState.errors.name && (
							<p className="text-xs text-destructive">
								{form.formState.errors.name.message}
							</p>
						)}
					</ConfigInputField>
					<ConfigInputField
						id="store_tagline"
						label="Eslogan (título SEO)"
					>
						<Input
							id="store_tagline"
							placeholder="Streetwear premium"
							{...form.register('tagline')}
						/>
					</ConfigInputField>
					<ConfigInputField
						id="store_address"
						label="Dirección / ciudad"
					>
						<Input
							id="store_address"
							placeholder="Santiago, Chile"
							{...form.register('address')}
						/>
					</ConfigInputField>
					<ConfigInputField
						id="store_founded_year"
						label="Año de fundación"
						helper={`Entre ${MIN_FOUNDED_YEAR} y ${currentYear}.`}
					>
						<Input
							id="store_founded_year"
							type="number"
							min={MIN_FOUNDED_YEAR}
							max={currentYear}
							{...form.register('foundedYear', { valueAsNumber: true })}
						/>
						{form.formState.errors.foundedYear && (
							<p className="text-xs text-destructive">
								{form.formState.errors.foundedYear.message}
							</p>
						)}
					</ConfigInputField>
					<ConfigInputField id="store_rut" label="RUT (opcional)">
						<Input
							id="store_rut"
							placeholder="76.123.456-7"
							{...form.register('rut')}
						/>
					</ConfigInputField>
				</div>

				<ConfigInputField
					id="store_description"
					label="Descripción (meta description SEO)"
				>
					<Input
						id="store_description"
						placeholder="Marca de streetwear premium. Drops limitados."
						{...form.register('description')}
					/>
				</ConfigInputField>

				<ConfigPreview title="Vista previa del título del sitio">
					<p className="text-sm">
						{(values.name || storeInfo.name).toUpperCase()}
						{values.tagline ? ` | ${values.tagline}` : ''}
					</p>
				</ConfigPreview>
			</ConfigSectionCard>
		</form>
	)
}

export function AnnouncementBarConfigForm({
	initialData,
	isActive,
}: {
	initialData?: Record<string, unknown> | null
	isActive?: boolean
}) {
	const { isPending, submit } = useConfigSubmit()
	const form = useForm<z.infer<typeof announcementBarFormSchema>>({
		resolver: zodResolver(announcementBarFormSchema),
		defaultValues: {
			isActive: isActive ?? true,
			message: String(initialData?.message || ''),
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
		fd.set('message', data.message)
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

				<ConfigPreview title="Vista previa de barra">
					<div
						className="flex items-center rounded px-3 py-2 text-sm"
						style={{
							backgroundColor: values.backgroundColor,
							color: values.textColor,
						}}
					>
						<span>{values.message || 'Tu mensaje aquí'}</span>
					</div>
				</ConfigPreview>
			</ConfigSectionCard>
		</form>
	)
}

export function StoreSettingsConfigForm({
	initialData,
}: {
	initialData?: Record<string, unknown> | null
}) {
	const storedStoreName = String(initialData?.storeName || 'etiqueta-roja')
	const storedCurrency = String(
		initialData?.currency || STORE_SETTINGS_CURRENCY,
	)
	const storedTimezone = String(
		initialData?.timezone || STORE_SETTINGS_TIMEZONE,
	)
	const storedSupportEmail = String(initialData?.supportEmail || '—')

	return (
		<ConfigSectionCard
			title="Ajustes de tienda"
			description="Configuración interna fija. Estos valores los gestiona el administrador del sitio directamente."
		>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<ConfigInputField
					id="store_name_internal"
					label="Nombre interno"
					helper="Identificador interno de la app. No editable desde el panel."
				>
					<Input
						id="store_name_internal"
						value={storedStoreName}
						readOnly
						aria-readonly="true"
						className="bg-muted/40 text-muted-foreground"
					/>
				</ConfigInputField>
				<ConfigInputField
					id="support_email_info"
					label="Correo de soporte"
					helper="Gestionado directamente por el administrador del sitio."
				>
					<Input
						id="support_email_info"
						value={storedSupportEmail}
						readOnly
						aria-readonly="true"
						className="bg-muted/40 text-muted-foreground"
					/>
				</ConfigInputField>
				<ConfigInputField
					id="currency_info"
					label="Moneda"
					helper="Fijada en CLP."
				>
					<Input
						id="currency_info"
						value={storedCurrency}
						readOnly
						aria-readonly="true"
						className="bg-muted/40 text-muted-foreground"
					/>
				</ConfigInputField>
				<ConfigInputField
					id="timezone_info"
					label="Zona horaria"
					helper="Fijada en America/Santiago."
				>
					<Input
						id="timezone_info"
						value={storedTimezone}
						readOnly
						aria-readonly="true"
						className="bg-muted/40 text-muted-foreground"
					/>
				</ConfigInputField>
			</div>
		</ConfigSectionCard>
	)
}
