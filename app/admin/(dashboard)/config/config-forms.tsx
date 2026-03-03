'use client'

import { useActionState } from 'react'
import {
	updatePromoBanner,
	updateContactInfo,
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
import {
	PromoBannerConfig,
	ContactInfoConfig,
} from '@/lib/services/site-config-server'

const initialState = { message: '', error: false }

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
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
