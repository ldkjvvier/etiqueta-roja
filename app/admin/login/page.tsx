'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const supabase = createClient()

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) {
			alert(error.message)
			setLoading(false)
		} else {
			router.push('/admin')
			router.refresh()
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
			<form
				onSubmit={handleLogin}
				className="w-full max-w-md space-y-6 p-8 border border-gray-200 dark:border-gray-800 rounded-lg shadow-md bg-white dark:bg-black"
			>
				<div className="text-center">
					<h1 className="text-2xl font-bold">Admin Login</h1>
					<p className="text-gray-500">
						Ingresa para gestionar la web
					</p>
				</div>
				<div>
					<label className="block text-sm font-medium mb-2">
						Email
					</label>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
						placeholder="admin@example.com"
						required
					/>
				</div>
				<div>
					<label className="block text-sm font-medium mb-2">
						Password
					</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
						required
					/>
				</div>
				<Button type="submit" className="w-full" disabled={loading}>
					{loading ? 'Entrando...' : 'Entrar'}
				</Button>
			</form>
		</div>
	)
}
