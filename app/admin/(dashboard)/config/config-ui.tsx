'use client'

import { ReactNode } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'

export function ConfigSectionCard({
	title,
	description,
	children,
	footer,
}: {
	title: string
	description: string
	children: ReactNode
	footer?: ReactNode
}) {
	return (
		<Card className="border-border/70">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">{children}</CardContent>
			{footer ? <CardFooter>{footer}</CardFooter> : null}
		</Card>
	)
}

export function ConfigToggle({
	id,
	label,
	help,
	checked,
	onCheckedChange,
}: {
	id: string
	label: string
	help?: string
	checked: boolean
	onCheckedChange: (checked: boolean) => void
}) {
	return (
		<div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5">
			<div>
				<Label htmlFor={id}>{label}</Label>
				{help ? (
					<p className="text-xs text-muted-foreground">{help}</p>
				) : null}
			</div>
			<Switch
				id={id}
				checked={checked}
				onCheckedChange={onCheckedChange}
			/>
		</div>
	)
}

export function ConfigInputField({
	id,
	label,
	helper,
	children,
}: {
	id: string
	label: string
	helper?: string
	children: ReactNode
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			{children}
			{helper ? (
				<p className="text-xs text-muted-foreground">{helper}</p>
			) : null}
		</div>
	)
}

export function ConfigColorPicker({
	id,
	label,
	value,
	onChange,
}: {
	id: string
	label: string
	value: string
	onChange: (value: string) => void
}) {
	return (
		<ConfigInputField id={id} label={label}>
			<div className="flex items-center gap-2 rounded-md border bg-background px-2 py-2">
				<Input
					id={id}
					type="color"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					className="h-9 w-12 cursor-pointer border-0 p-0"
				/>
				<span className="text-xs font-mono text-muted-foreground">
					{value}
				</span>
			</div>
		</ConfigInputField>
	)
}

export function ConfigPreview({
	title,
	children,
}: {
	title: string
	children: ReactNode
}) {
	return (
		<div className="rounded-lg border bg-background p-4">
			<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				{title}
			</p>
			{children}
		</div>
	)
}
