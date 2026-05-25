import Image from 'next/image'
import { ReactNode } from 'react'
import { HeroStudioState } from '@/types/heroStudio.types'

interface HeroBannerLayoutProps {
	bannerHeight: HeroStudioState['layout']['bannerHeight']
	overlayOpacity: number
	backgroundImage?: string
	backgroundImageMobile?: string
	backgroundVideoUrl?: string
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
	fullscreen: 'min-h-screen',
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
						`relative ${HEIGHT_CLASS_BY_SETTING[bannerHeight]} py-14`,
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
