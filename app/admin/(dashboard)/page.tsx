import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/admin/login')
	}

	return (
		<div className="max-w-5xl">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold">
						Panel de Administración
					</h1>
					<p className="text-muted-foreground">
						Bienvenido, {user.email}
					</p>
				</div>
				<form
					action={async () => {
						'use server'
						const sb = await createClient()
						await sb.auth.signOut()
						redirect('/')
					}}
				>
					<Button variant="outline">Cerrar Sesión</Button>
				</form>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
					<h2 className="text-xl font-semibold mb-2">Productos</h2>
					<p className="text-muted-foreground mb-4">
						Gestionar inventario, precios y descripciones.
					</p>
					<Button className="w-full">Próximamente</Button>
				</div>
				{/* Add more widgets here */}
			</div>
		</div>
	)
}
