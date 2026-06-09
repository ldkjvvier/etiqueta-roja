import { Star } from 'lucide-react'
import { getStoreSocialLinks } from '@/lib/data/social-links'
import { getStoreInfo } from '@/lib/data/store-info'

export async function Footer() {
	const info = await getStoreSocialLinks()
	const storeInfo = await getStoreInfo()
	const supportLinks = info.email
		? [{ label: 'CONTACTO', href: `mailto:${info.email}` }]
		: []
	const socialLinks = [
		info.instagram?.trim()
			? {
					label: 'INSTAGRAM',
					href: info.instagram,
				}
			: null,
		info.twitter?.trim()
			? {
					label: 'TWITTER',
					href: info.twitter,
				}
			: null,
		info.facebook?.trim()
			? {
					label: 'FACEBOOK',
					href: info.facebook,
				}
			: null,
		info.tiktok?.trim()
			? {
					label: 'TIKTOK',
					href: info.tiktok,
				}
			: null,
		info.whatsapp?.trim()
			? {
					label: 'WHATSAPP',
					href: `https://wa.me/${info.whatsapp.replace(/[^0-9]/g, '')}`,
				}
			: null,
	].filter(
		(
			item,
		): item is {
			label: string
			href: string
		} => Boolean(item),
	)
	const gridClassName =
		supportLinks.length > 0 && socialLinks.length > 0
			? 'grid grid-cols-1 md:grid-cols-3 gap-8'
			: supportLinks.length > 0 || socialLinks.length > 0
				? 'grid grid-cols-1 md:grid-cols-2 gap-8'
				: 'grid grid-cols-1 gap-8'

	return (
		<footer
			id="contacto"
			className="bg-[#DCDCDC] text-foreground border-t border-border"
		>
			<div className="container mx-auto px-4 py-12">
				<div className={gridClassName}>
					{/* Brand */}
					<div>
						<span className="text-xl font-black tracking-tighter">
							ETIQUETA R
							<Star className="inline-block w-4 h-4 fill-primary text-primary -mt-1" />
							JA
						</span>
						<p className="mt-4 text-xs font-mono text-foreground/70 max-w-xs leading-relaxed">
							STREETWEAR PREMIUM PARA LOS QUE NO SIGUEN TENDENCIAS,
							LAS CREAN.
						</p>
					</div>

					{/* Support */}
					{supportLinks.length > 0 ? (
						<div>
							<h4 className="font-mono font-bold text-xs uppercase tracking-wider mb-4 border-b border-foreground/20 pb-2">
								[CONTACTO]
							</h4>
							<ul className="space-y-2 text-xs font-mono text-foreground/70">
								{supportLinks.map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											className="hover:text-foreground transition-colors"
										>
											&gt; {link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					) : null}

					{/* Socials */}
					{socialLinks.length > 0 ? (
						<div>
							<h4 className="font-mono font-bold text-xs uppercase tracking-wider mb-4 border-b border-foreground/20 pb-2">
								[REDES]
							</h4>
							<ul className="space-y-2 text-xs font-mono text-foreground/70">
								{socialLinks.map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											target="_blank"
											rel="noopener noreferrer"
											className="hover:text-foreground transition-colors"
										>
											&gt; {link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					) : null}
				</div>

				{/* Receipt-style bottom */}
				<div className="border-t border-foreground/20 mt-12 pt-6">
					<div className="font-mono text-[10px] text-foreground/50 text-center space-y-1">
						<p>================================</p>
						<p>
							© {new Date().getFullYear()}{' '}
							{storeInfo.name.toUpperCase()}
						</p>
						{storeInfo.address ? <p>{storeInfo.address}</p> : null}
						<p>TODOS LOS DERECHOS RESERVADOS</p>
						<p>================================</p>
					</div>
				</div>
			</div>
		</footer>
	)
}
