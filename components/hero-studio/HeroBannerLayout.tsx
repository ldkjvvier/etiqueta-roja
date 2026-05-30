import Image from 'next/image'
import { ReactNode } from 'react'
import { HeroStudioState, HeroLayoutPreset } from '@/types/heroStudio.types'

export type { HeroLayoutPreset }

interface HeroBannerLayoutProps {
	bannerHeight: HeroStudioState['layout']['bannerHeight']
	overlayOpacity: number
	backgroundImage?: string
	backgroundImageMobile?: string
	backgroundVideoUrl?: string
	preset?: HeroLayoutPreset
	rootClassName?: string
	canvasClassName?: string
	containerClassName?: string
	showBottomBorder?: boolean
	renderEmbeddableVideo?: boolean
	canvasRef?: React.Ref<HTMLDivElement>
	onCanvasPointerMove?: (
		event: React.PointerEvent<HTMLDivElement>,
	) => void
	onCanvasPointerUp?: (
		event: React.PointerEvent<HTMLDivElement>,
	) => void
	onCanvasPointerLeave?: (
		event: React.PointerEvent<HTMLDivElement>,
	) => void
	children: ReactNode
}

const HEIGHT_CLASS_BY_SETTING: Record<
	HeroStudioState['layout']['bannerHeight'],
	string
> = {
	normal: 'min-h-[50vh]',
	large: 'min-h-[75vh]',
	fullscreen: 'min-h-[100dvh]',
}

function isEmbeddableVideoUrl(url: string) {
	const normalized = url.toLowerCase()
	return (
		normalized.includes('vimeo.com') ||
		normalized.includes('youtube.com') ||
		normalized.includes('youtu.be')
	)
}

function cx(...values: Array<string | undefined | false>) {
	return values.filter(Boolean).join(' ')
}

export function HeroBannerLayout({
	bannerHeight,
	overlayOpacity,
	backgroundImage,
	backgroundImageMobile,
	backgroundVideoUrl,
	preset,
	rootClassName,
	canvasClassName,
	containerClassName,
	showBottomBorder = false,
	renderEmbeddableVideo = false,
	canvasRef,
	onCanvasPointerMove,
	onCanvasPointerUp,
	onCanvasPointerLeave,
	children,
}: HeroBannerLayoutProps) {
	const heightClass = HEIGHT_CLASS_BY_SETTING[bannerHeight]
	const isSplitPreset =
		preset === 'editorial-left' || preset === 'product-right'

	// --- SPLIT LAYOUT (editorial-left, product-right) ---
	if (isSplitPreset) {
		const gridCols =
			preset === 'product-right'
				? 'md:grid-cols-[40%_60%]'
				: 'md:grid-cols-2'

		return (
			<section
				className={cx(
					'relative border-b border-border overflow-hidden',
					rootClassName,
				)}
			>
				<div className={cx('grid grid-cols-1', gridCols)}>
					{/* Content column — below image on mobile, left on desktop */}
					<div
						className={cx(
							'relative order-2 md:order-1 bg-secondary overflow-hidden',
							heightClass,
						)}
					>
						<div
							ref={canvasRef}
							className={cx(
								'relative h-full flex flex-col justify-center px-8 md:px-12 lg:px-16 py-14',
								canvasClassName,
							)}
							onPointerMove={onCanvasPointerMove}
							onPointerUp={onCanvasPointerUp}
							onPointerLeave={onCanvasPointerLeave}
						>
							{children}
						</div>
					</div>

					{/* Image column — above content on mobile, right on desktop */}
					<div
						className={cx(
							'relative order-1 md:order-2 overflow-hidden',
							heightClass,
						)}
					>
						{backgroundImageMobile &&
						backgroundImageMobile !== backgroundImage ? (
							<Image
								src={backgroundImageMobile}
								alt=""
								aria-hidden="true"
								fill
								priority
								fetchPriority="high"
								sizes="100vw"
								className="object-cover md:hidden"
							/>
						) : null}
						{backgroundImage ? (
							<Image
								src={backgroundImage}
								alt=""
								aria-hidden="true"
								fill
								priority
								fetchPriority="high"
								sizes={
									preset === 'product-right' ? '60vw' : '50vw'
								}
								className={cx(
									'object-cover',
									backgroundImageMobile &&
										backgroundImageMobile !== backgroundImage
										? 'hidden md:block'
										: '',
								)}
							/>
						) : (
							<div className="absolute inset-0 bg-muted" />
						)}
					</div>
				</div>

				{showBottomBorder && (
					<div className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
				)}
			</section>
		)
	}

	// --- FULLBLEED LAYOUT (centered, fullbleed-bottom, or no preset) ---
	// canvas flex classes based on preset; legacy (no preset) keeps py-14 only
	const canvasPresetClass =
		preset === 'centered'
			? 'flex flex-col items-center justify-center py-14'
			: preset === 'fullbleed-bottom'
			? 'flex flex-col justify-end pb-16 pt-14'
			: 'py-14'

	return (
		<section
			className={cx(
				'relative overflow-hidden border-b border-border bg-secondary',
				rootClassName,
			)}
		>
			{backgroundVideoUrl ? (
				renderEmbeddableVideo &&
				isEmbeddableVideoUrl(backgroundVideoUrl) ? (
					<iframe
						src={backgroundVideoUrl}
						className="pointer-events-none absolute inset-0 h-full w-full"
						title="Hero background video"
						allow="autoplay; fullscreen; picture-in-picture"
						aria-hidden="true"
						loading="lazy"
						tabIndex={-1}
					/>
				) : (
					<video
						className="pointer-events-none absolute inset-0 h-full w-full object-cover"
						aria-hidden="true"
						autoPlay
						loop
						muted
						playsInline
						preload="metadata"
					>
						<source src={backgroundVideoUrl} />
					</video>
				)
			) : backgroundImage ? (
				<>
					{backgroundImageMobile &&
					backgroundImageMobile !== backgroundImage ? (
						<Image
							src={backgroundImageMobile}
							alt=""
							aria-hidden="true"
							fill
							priority
							fetchPriority="high"
							sizes="100vw"
							className="absolute inset-0 object-cover md:hidden"
						/>
					) : null}
					<Image
						src={backgroundImage}
						alt=""
						aria-hidden="true"
						fill
						priority
						fetchPriority="high"
						sizes="100vw"
						className={cx(
							'absolute inset-0 object-cover',
							backgroundImageMobile &&
								backgroundImageMobile !== backgroundImage
								? 'hidden md:block'
								: undefined,
						)}
					/>
				</>
			) : null}

			<div
				className="absolute inset-0 z-0 bg-black"
				style={{ opacity: overlayOpacity / 100 }}
			/>

			<div
				className={cx(
					'relative z-10 container mx-auto px-4',
					containerClassName,
				)}
			>
				<div
					ref={canvasRef}
					className={cx(
						`relative ${heightClass}`,
						canvasPresetClass,
						canvasClassName,
					)}
					onPointerMove={onCanvasPointerMove}
					onPointerUp={onCanvasPointerUp}
					onPointerLeave={onCanvasPointerLeave}
				>
					{children}
				</div>
			</div>

			{showBottomBorder && (
				<div className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
			)}
		</section>
	)
}
