import { z } from 'zod'

export const STORE_SETTINGS_CURRENCY = 'CLP' as const
export const STORE_SETTINGS_TIMEZONE = 'America/Santiago' as const

export const storeSettingsEditableFieldsSchema = z.object({
	storeName: z.string().trim().min(1).max(80),
	supportEmail: z.string().trim().email().max(120),
})

export const storeSettingsSchema =
	storeSettingsEditableFieldsSchema.extend({
		currency: z.literal(STORE_SETTINGS_CURRENCY),
		timezone: z.literal(STORE_SETTINGS_TIMEZONE),
	})

export function isSupportedStoreCurrency(
	value: string | undefined | null,
): value is typeof STORE_SETTINGS_CURRENCY {
	return value === STORE_SETTINGS_CURRENCY
}

export function isSupportedStoreTimezone(
	value: string | undefined | null,
): value is typeof STORE_SETTINGS_TIMEZONE {
	return value === STORE_SETTINGS_TIMEZONE
}
