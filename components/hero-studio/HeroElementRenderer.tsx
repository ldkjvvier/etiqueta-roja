'use client'

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { HeroDropCountdown } from '@/components/HeroDropCountdown'
import { HeroDropPreview } from '@/services/heroDropService'
import {
	HeroElementType,
	HeroStudioState,
} from '@/types/heroStudio.types'

type DragPropsGetter = (target: HeroElementType) => {
	onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
	style: React.CSSProperties
}

interface HeroElementRendererProps {
	state: HeroStudioState
	dropPreview: HeroDropPreview
	dragEnabled: boolean
	dragTarget: HeroElementType | null
	getDragProps?: DragPropsGetter
}

function getAlignmentClass(alignment: 'left' | 'center' | 'right') {
	if (alignment === 'center') return 'items-center text-center'
	if (alignment === 'right') return 'items-end text-right'
	return 'items-start text-left'
}

function getTitleWeightClass(weight: 'bold' | 'black' | 'outline') {
	if (weight === 'bold') return 'font-bold'
	if (weight === 'outline') {
		return 'font-black text-transparent [-webkit-text-stroke:2px_currentColor]'
	}
	return 'font-black'
}

function DragHandle({ label }: { label: string }) {
	return (
		<div className="pointer-events-none absolute -top-7 left-0 z-20 inline-flex rounded border bg-black/45 px-2 py-1 text-[10px] font-semibold tracking-wider text-white">
			{label}
		</div>
	)
}

function HeroElementRendererComponent({
	state,
	dropPreview,
	dragEnabled,
	dragTarget,
	getDragProps,
}: HeroElementRendererProps) {
	const alignmentClass = getAlignmentClass(
		state.layout.contentAlignment,
	)
	const titleWeightClass = getTitleWeightClass(
		state.styles.titleFontWeight,
	)

	const renderDragProps = (target: HeroElementType) => {
		if (!dragEnabled || !getDragProps) {
			return {
				style: {
					left: `${state.positions[target].x}%`,
					top: `${state.positions[target].y}%`,
					transform: 'translate(-50%, -50%)',
				} as React.CSSProperties,
				onPointerDown: undefined,
			}
		}
		return getDragProps(target)
	}

	const badgeDragProps = renderDragProps('badge')
	const titleDragProps = renderDragProps('title')
	const descriptionDragProps = renderDragProps('description')
	const messageDragProps = renderDragProps('drop-message')
	const countdownDragProps = renderDragProps('countdown')
	const liveBadgeDragProps = renderDragProps('live-badge')
	const ctaDragProps = renderDragProps('cta')

	return (
		<>
			{state.content.badge && (
				<div
					className={`absolute ${dragEnabled && dragTarget === 'badge' ? 'ring-2 ring-primary' : ''} ${dragEnabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
					style={badgeDragProps.style}
					onPointerDown={badgeDragProps.onPointerDown}
				>
					{dragEnabled && <DragHandle label="Mover badge" />}
					<p
						className={`text-sm font-bold tracking-widest ${alignmentClass}`}
						style={{ color: state.styles.badgeColor }}
					>
						{state.content.badge}
					</p>
				</div>
			)}

			<div
				className={`absolute max-w-2xl ${alignmentClass} ${dragEnabled && dragTarget === 'title' ? 'ring-2 ring-primary' : ''} ${dragEnabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
				style={titleDragProps.style}
				onPointerDown={titleDragProps.onPointerDown}
			>
				{dragEnabled && <DragHandle label="Mover título" />}
				<h1
					className={`text-balance text-5xl leading-none tracking-tighter md:text-7xl lg:text-8xl ${titleWeightClass}`}
					style={{ color: state.styles.titleColor }}
				>
					{state.content.title || 'Título principal del Hero'}
				</h1>
			</div>

			{state.content.description && (
				<div
					className={`absolute max-w-xl ${alignmentClass} ${dragEnabled && dragTarget === 'description' ? 'ring-2 ring-primary' : ''} ${dragEnabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
					style={descriptionDragProps.style}
					onPointerDown={descriptionDragProps.onPointerDown}
				>
					{dragEnabled && <DragHandle label="Mover descripción" />}
					<p
						className="text-lg md:text-xl"
						style={{ color: state.styles.descriptionColor }}
					>
						{state.content.description}
					</p>
				</div>
			)}

			{dropPreview.showMessage && dropPreview.message && (
				<div
					className={`absolute max-w-lg ${dragEnabled && dragTarget === 'drop-message' ? 'ring-2 ring-primary' : ''} ${dragEnabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
					style={{
						...messageDragProps.style,
						textAlign: state.dropConfig.dropTextAlignment,
					}}
					onPointerDown={messageDragProps.onPointerDown}
				>
					{dragEnabled && <DragHandle label="Mover mensaje drop" />}
					<p className="text-sm font-semibold tracking-wide text-white/90">
						{dropPreview.message}
					</p>
				</div>
			)}

			{dropPreview.showCountdown && dropPreview.countdownTarget && (
				<div
					className={`absolute ${dragEnabled && dragTarget === 'countdown' ? 'ring-2 ring-primary' : ''} ${dragEnabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
					style={countdownDragProps.style}
					onPointerDown={countdownDragProps.onPointerDown}
				>
					{dragEnabled && <DragHandle label="Mover countdown" />}
					<HeroDropCountdown
						targetDate={dropPreview.countdownTarget}
						containerBgColor={state.dropConfig.dropCountdownBgColor}
						unitBgColor="rgba(0,0,0,0.35)"
						textColor={state.dropConfig.dropCountdownTextColor}
					/>
				</div>
			)}

			{dropPreview.showLiveBadge &&
				state.dropConfig.dropLiveBadgeText && (
					<div
						className={`absolute ${dragEnabled && dragTarget === 'live-badge' ? 'ring-2 ring-primary' : ''} ${dragEnabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
						style={liveBadgeDragProps.style}
						onPointerDown={liveBadgeDragProps.onPointerDown}
					>
						{dragEnabled && <DragHandle label="Mover live badge" />}
						<span
							className="inline-flex w-fit rounded-md px-3 py-1 text-xs font-bold tracking-wider"
							style={{
								backgroundColor:
									state.dropConfig.dropLiveBadgeBgColor,
								color: state.dropConfig.dropLiveBadgeTextColor,
							}}
						>
							{state.dropConfig.dropLiveBadgeText}
						</span>
					</div>
				)}

			{dropPreview.showCta && dropPreview.ctaText && (
				<div
					className={`absolute ${dragEnabled && dragTarget === 'cta' ? 'ring-2 ring-primary' : ''} ${dragEnabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
					style={ctaDragProps.style}
					onPointerDown={ctaDragProps.onPointerDown}
				>
					{dragEnabled && <DragHandle label="Mover CTA" />}
					{dropPreview.ctaDisabled ? (
						<Button
							disabled
							tabIndex={-1}
							aria-disabled="true"
							className="cursor-not-allowed px-10 py-6 text-base font-bold opacity-80"
							style={{
								backgroundColor: state.styles.buttonBgColor,
								color: state.styles.buttonTextColor,
							}}
						>
							{dropPreview.ctaText}
						</Button>
					) : (
						<Button
							type="button"
							className="px-10 py-6 text-base font-bold"
							style={{
								backgroundColor: state.styles.buttonBgColor,
								color: state.styles.buttonTextColor,
							}}
						>
							{dropPreview.ctaText}
						</Button>
					)}
				</div>
			)}
		</>
	)
}

export const HeroElementRenderer = memo(HeroElementRendererComponent)
