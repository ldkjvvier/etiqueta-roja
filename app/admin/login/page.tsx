import { LoginForm } from './login-form'

type LoginPageSearchParams = Promise<{
	[key: string]: string | string[] | undefined
}>

function getSingleParam(
	value: string | string[] | undefined,
): string | undefined {
	return typeof value === 'string' ? value : undefined
}

function getUnauthorizedReason(
	accessReason: string | undefined,
	requestedStore: string | undefined,
) {
	if (accessReason === 'missing-role') {
		return requestedStore
			? `Tu usuario está autenticado, pero no tiene rol store_admin o super_admin para la tienda ${requestedStore}.`
			: 'Tu usuario está autenticado, pero no tiene rol store_admin o super_admin para ninguna tienda activa.'
	}

	if (accessReason === 'unauthorized') {
		return 'Tu usuario no tiene permisos de administrador para esta tienda.'
	}

	return null
}

export default async function LoginPage({
	searchParams,
}: {
	searchParams: LoginPageSearchParams
}) {
	const params = await searchParams
	const accessReason = getSingleParam(params.reason)
	const requestedStore = getSingleParam(params.store)?.trim()
	const unauthorizedReason = getUnauthorizedReason(
		accessReason,
		requestedStore,
	)

	return <LoginForm unauthorizedReason={unauthorizedReason} />
}
