'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { cva } from 'class-variance-authority'
import { Button } from '@/components/ui/button'
import { HeroCTAConfig } from '@/lib/data/site-config'
import { cn } from '@/lib/utils'

const ctaButtonVariants = cva(
	'transition-all duration-200 font-bold tracking-wide px-6 focus-visible:ring-2 focus-visible:ring-ring',
	{
		variants: {
			variant: {
				solid:
					'border border-transparent bg-[var(--cta-bg)] text-[var(--cta-text)] hover:bg-[var(--cta-hover-bg)] hover:text-[var(--cta-hover-text)]',
				outline:
					'border bg-transparent border-[var(--cta-border)] text-[var(--cta-text)] hover:bg-[var(--cta-hover-bg)] hover:text-[var(--cta-hover-text)]',
				ghost:
					'border border-transparent bg-transparent text-[var(--cta-text)] hover:bg-[var(--cta-hover-bg)] hover:text-[var(--cta-hover-text)]',
			},
			size: {
				sm: 'h-9 text-sm',
				md: 'h-11 text-base',
				lg: 'h-13 text-lg',
			},
			radius: {
				none: 'rounded-none',
				sm: 'rounded-sm',
				md: 'rounded-md',
				lg: 'rounded-lg',
				full: 'rounded-full',
			},
			hoverEffect: {
				none: '',
				lift: 'hover:-translate-y-[2px] hover:shadow-md',
				scale: 'hover:scale-105',
				invert: '',
			},
			fullWidth: {
				true: 'w-full',
				false: 'w-auto',
			},
		},
	},
)

type HeroCTAClassInput = Pick<
	HeroCTAConfig,
	| 'variant'
	| 'size'
	| 'radius'
	| 'hoverEffect'
	| 'alignment'
	| 'fullWidth'
>

export function getHeroCTAClasses(config: HeroCTAClassInput) {
	const alignmentClass =
		config.alignment === 'center'
			? 'justify-center'
			: config.alignment === 'right'
				? 'justify-end'
				: 'justify-start'

	return {
		containerClassName: cn('flex', alignmentClass),
		buttonClassName: ctaButtonVariants({
			variant: config.variant,
			size: config.size,
			radius: config.radius,
			hoverEffect: config.hoverEffect,
			fullWidth: config.fullWidth,
		}),
	}
}

function buildHeroCTAStyles(config: HeroCTAConfig): CSSProperties {
	const hoverBg =
		config.hoverEffect === 'invert'
			? config.textColor
			: config.hoverBackgroundColor
	const hoverText =
		config.hoverEffect === 'invert'
			? config.backgroundColor
			: config.hoverTextColor

	return {
		'--cta-bg': config.backgroundColor,
		'--cta-text': config.textColor,
		'--cta-border': config.borderColor,
		'--cta-hover-bg': hoverBg,
		'--cta-hover-text': hoverText,
	} as CSSProperties
}

interface HeroCTAProps {
	config: HeroCTAConfig
	text: string
	href?: string
	disabled?: boolean
	forceButton?: boolean
	className?: string
}

export function HeroCTA({
	config,
	text,
	href,
	disabled,
	forceButton = false,
	className,
}: HeroCTAProps) {
	const classes = getHeroCTAClasses(config)
	const style = buildHeroCTAStyles(config)

	const buttonClassName = cn(classes.buttonClassName, className)

	if (disabled || forceButton || !href) {
		return (
			<div className={classes.containerClassName}>
				<Button
					type="button"
					disabled={disabled}
					tabIndex={disabled ? -1 : undefined}
					aria-disabled={disabled ? 'true' : undefined}
					className={cn(
						buttonClassName,
						disabled && 'cursor-not-allowed opacity-80',
					)}
					style={style}
				>
					{text}
				</Button>
			</div>
		)
	}

	return (
		<div className={classes.containerClassName}>
			<Button asChild className={buttonClassName} style={style}>
				<Link
					href={href}
					target={config.openInNewTab ? '_blank' : undefined}
					rel={
						config.openInNewTab ? 'noopener noreferrer' : undefined
					}
				>
					{text}
				</Link>
			</Button>
		</div>
	)
}
