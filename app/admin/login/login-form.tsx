'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface LoginFormProps {
	unauthorizedReason: string | null
}

function normalizeEmail(value: string) {
	return value.trim().toLowerCase()
}

function getLoginErrorMessage(message: string) {
	const normalizedMessage = message.trim().toLowerCase()

	if (normalizedMessage.includes('invalid login credentials')) {
		return 'Correo o contraseña incorrectos. Verifica que el correo esté escrito sin espacios y que el usuario exista y tenga el correo confirmado en Supabase Auth.'
	}

	if (normalizedMessage.includes('email not confirmed')) {
		return 'El correo del administrador aún no está confirmado en Supabase Auth.'
	}

	if (normalizedMessage.includes('email logins are disabled')) {
		return 'El acceso con correo y contraseña está deshabilitado en Supabase.'
	}

	if (
		normalizedMessage.includes('failed to fetch') ||
		normalizedMessage.includes('network')
	) {
		return 'No se pudo conectar con Supabase. Revisa tu conexión e intenta nuevamente.'
	}

	return `No se pudo iniciar sesión. Detalle: ${message}`
}

export function LoginForm({ unauthorizedReason }: LoginFormProps) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(
		null,
	)
	const router = useRouter()

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setErrorMessage(null)
		const normalizedEmail = normalizeEmail(email)

		try {
			const supabase = createClient()
			const { error } = await supabase.auth.signInWithPassword({
				email: normalizedEmail,
				password,
			})

			if (error) {
				setErrorMessage(getLoginErrorMessage(error.message))
				return
			}

			if (email !== normalizedEmail) {
				setEmail(normalizedEmail)
			}

			router.push('/admin')
			router.refresh()
		} catch (error) {
			console.error(error)
			setErrorMessage(
				'No se pudo inicializar la conexión con Supabase',
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
			<form
				onSubmit={handleLogin}
				aria-busy={loading}
				className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-md dark:border-gray-800 dark:bg-black"
			>
				<div className="text-center">
					<h1 className="text-2xl font-bold">Acceso admin</h1>
					<p className="text-gray-500">
						Ingresa para gestionar la tienda
					</p>
				</div>
				{unauthorizedReason ? (
					<p
						className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800"
						role="status"
					>
						{unauthorizedReason}
					</p>
				) : null}
				{errorMessage ? (
					<p
						id="admin-login-error"
						className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
						role="alert"
					>
						{errorMessage}
					</p>
				) : null}
				<div>
					<label
						htmlFor="admin-email"
						className="mb-2 block text-sm font-medium"
					>
						Correo
					</label>
					<input
						id="admin-email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full rounded-md border border-gray-300 bg-background p-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700"
						placeholder="admin@ejemplo.com"
						autoComplete="email"
						autoCapitalize="none"
						autoCorrect="off"
						spellCheck={false}
						aria-describedby={
							errorMessage ? 'admin-login-error' : undefined
						}
						aria-invalid={Boolean(errorMessage)}
						required
					/>
				</div>
				<div>
					<label
						htmlFor="admin-password"
						className="mb-2 block text-sm font-medium"
					>
						Contraseña
					</label>
					<input
						id="admin-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full rounded-md border border-gray-300 bg-background p-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700"
						autoComplete="current-password"
						aria-describedby={
							errorMessage ? 'admin-login-error' : undefined
						}
						aria-invalid={Boolean(errorMessage)}
						required
					/>
				</div>
				<Button
					type="submit"
					className="w-full"
					disabled={loading}
					aria-busy={loading}
				>
					{loading ? 'Entrando...' : 'Entrar'}
				</Button>
			</form>
		</div>
	)
}
