'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const router = useRouter()
	const searchParams = useSearchParams()
	const accessReason = searchParams.get('reason')
	const requestedStore = searchParams.get('store')?.trim()
	const unauthorizedReason =
		accessReason === 'missing-role'
			? requestedStore
				? `Tu usuario está autenticado, pero no tiene rol store_admin o super_admin para la tienda ${requestedStore}.`
				: 'Tu usuario está autenticado, pero no tiene rol store_admin o super_admin para ninguna tienda activa.'
			: accessReason === 'unauthorized'
				? 'Tu usuario no tiene permisos de administrador para esta tienda.'
				: null

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setErrorMessage(null)

		try {
			const supabase = createClient()
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			})

			if (error) {
				setErrorMessage(error.message)
				return
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
				className="w-full max-w-md space-y-6 p-8 border border-gray-200 dark:border-gray-800 rounded-lg shadow-md bg-white dark:bg-black"
			>
				<div className="text-center">
					<h1 className="text-2xl font-bold">Admin Login</h1>
					<p className="text-gray-500">
						Ingresa para gestionar la web
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
						className="block text-sm font-medium mb-2"
					>
						Email
					</label>
					<input
						id="admin-email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
						placeholder="admin@example.com"
						autoComplete="email"
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
						className="block text-sm font-medium mb-2"
					>
						Password
					</label>
					<input
						id="admin-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
