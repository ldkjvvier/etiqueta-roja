import { useCallback, useRef, useState } from 'react'
import {
	HeroDragTarget,
	HeroElementType,
	HeroPosition,
	HeroPositions,
} from '@/types/heroStudio.types'
import { clampPercent } from '@/services/heroDropService'

interface UseHeroDragEditorArgs {
	positions: HeroPositions
	onPositionChange: (target: HeroElementType, position: HeroPosition) => void
	enabled: boolean
}

type DragAnchor = {
	target: HeroElementType
	pointerId: number
	xRatio: number
	yRatio: number
	elementWidth: number
	elementHeight: number
}

export function useHeroDragEditor({
	positions,
	onPositionChange,
	enabled,
}: UseHeroDragEditorArgs) {
	const canvasRef = useRef<HTMLDivElement | null>(null)
	const [dragTarget, setDragTarget] = useState<HeroDragTarget>(null)
	const anchorRef = useRef<DragAnchor | null>(null)

	const updateFromPointer = useCallback(
		(clientX: number, clientY: number) => {
			const canvas = canvasRef.current
			const anchor = anchorRef.current

			if (!enabled || !canvas || !anchor) {
				return
			}

			const canvasRect = canvas.getBoundingClientRect()
			const left =
				clientX -
				canvasRect.left -
				anchor.xRatio * anchor.elementWidth +
				anchor.elementWidth / 2
			const top =
				clientY -
				canvasRect.top -
				anchor.yRatio * anchor.elementHeight +
				anchor.elementHeight / 2

			const x = clampPercent((left / canvasRect.width) * 100)
			const y = clampPercent((top / canvasRect.height) * 100)

			onPositionChange(anchor.target, { x, y })
		},
		[enabled, onPositionChange],
	)

	const onPointerDown = useCallback(
		(target: HeroElementType, event: React.PointerEvent<HTMLDivElement>) => {
			if (!enabled || !canvasRef.current) {
				return
			}

			event.preventDefault()
			event.stopPropagation()

			const elementRect = event.currentTarget.getBoundingClientRect()
			const xRatio = elementRect.width
				? (event.clientX - elementRect.left) / elementRect.width
				: 0.5
			const yRatio = elementRect.height
				? (event.clientY - elementRect.top) / elementRect.height
				: 0.5

			anchorRef.current = {
				target,
				pointerId: event.pointerId,
				xRatio: clampPercent(xRatio * 100) / 100,
				yRatio: clampPercent(yRatio * 100) / 100,
				elementWidth: elementRect.width,
				elementHeight: elementRect.height,
			}
			setDragTarget(target)
			event.currentTarget.setPointerCapture(event.pointerId)
			updateFromPointer(event.clientX, event.clientY)
		},
		[enabled, updateFromPointer],
	)

	const clearDrag = useCallback(() => {
		anchorRef.current = null
		setDragTarget(null)
	}, [])

	const onCanvasPointerMove = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (!enabled || !anchorRef.current) {
				return
			}
			if (anchorRef.current.pointerId !== event.pointerId) {
				return
			}
			updateFromPointer(event.clientX, event.clientY)
		},
		[enabled, updateFromPointer],
	)

	const onCanvasPointerUp = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (!enabled || !anchorRef.current) {
				return
			}
			if (anchorRef.current.pointerId !== event.pointerId) {
				return
			}
			clearDrag()
		},
		[clearDrag, enabled],
	)

	const getDraggableProps = useCallback(
		(target: HeroElementType) => {
			return {
				onPointerDown: (event: React.PointerEvent<HTMLDivElement>) =>
					onPointerDown(target, event),
				style: {
					left: `${positions[target].x}%`,
					top: `${positions[target].y}%`,
					transform: 'translate(-50%, -50%)',
				},
			}
		},
		[onPointerDown, positions],
	)

	return {
		canvasRef,
		dragTarget,
		setDragTarget,
		onCanvasPointerMove,
		onCanvasPointerUp,
		getDraggableProps,
		clearDrag,
	}
}
