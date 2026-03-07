'use client'

import { HeroDropOption, HeroStudioState } from '@/types/heroStudio.types'
import { HeroControlsSidebar } from './HeroControlsSidebar'

type Dispatch = React.ComponentProps<typeof HeroControlsSidebar>['dispatch']

interface HeroConfigFormProps {
	state: HeroStudioState
	dispatch: Dispatch
	dropOptions?: HeroDropOption[]
}

export function HeroConfigForm({
	state,
	dispatch,
	dropOptions,
}: HeroConfigFormProps) {
	return (
		<HeroControlsSidebar
			state={state}
			dispatch={dispatch}
			dropOptions={dropOptions}
		/>
	)
}
