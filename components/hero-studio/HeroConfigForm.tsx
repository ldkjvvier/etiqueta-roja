'use client'

import {
	HeroDropOption,
	HeroStudioState,
} from '@/types/heroStudio.types'
import { HeroControlsSidebar } from './HeroControlsSidebar'

type Dispatch = React.ComponentProps<
	typeof HeroControlsSidebar
>['dispatch']

interface HeroConfigFormProps {
	state: HeroStudioState
	dispatch: Dispatch
	dropOptions?: HeroDropOption[]
	/** Changes identity after each save so the sidebar can re-seed its form. */
	saveSignal?: unknown
}

export function HeroConfigForm({
	state,
	dispatch,
	dropOptions,
	saveSignal,
}: HeroConfigFormProps) {
	return (
		<HeroControlsSidebar
			state={state}
			dispatch={dispatch}
			dropOptions={dropOptions}
			saveSignal={saveSignal}
		/>
	)
}
