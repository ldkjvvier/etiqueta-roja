import { UseFormReturn } from 'react-hook-form'
import { HeroDropOption } from '@/types/heroStudio.types'
import { HeroSidebarFormValues } from './hero-sidebar-form'

export type HeroSetField = (
	section:
		| 'content'
		| 'media'
		| 'cta'
		| 'layout'
		| 'styles'
		| 'dropConfig',
	key: string,
	value: string | number | boolean,
) => void

export interface HeroSectionProps {
	form: UseFormReturn<HeroSidebarFormValues>
	setField: HeroSetField
	setTopLevel: (
		key: 'isActive',
		value: string | boolean,
	) => void
	dropOptions?: HeroDropOption[]
	applyPreset?: (presetId: string) => void
}
