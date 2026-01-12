import { Star } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#DCDCDC] text-foreground border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="text-xl font-black tracking-tighter">
              ETIQUETA R<Star className="inline-block w-4 h-4 fill-primary text-primary -mt-1" />
              JA
            </span>
            <p className="mt-4 text-xs font-mono text-foreground/70 max-w-xs leading-relaxed">
              STREETWEAR PREMIUM PARA LOS QUE NO SIGUEN TENDENCIAS, LAS CREAN.
            </p>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-mono font-bold text-xs uppercase tracking-wider mb-4 border-b border-foreground/20 pb-2">
              [SUPPORT]
            </h4>
            <ul className="space-y-2 text-xs font-mono text-foreground/70">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  &gt; FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  &gt; ENVÍOS
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  &gt; DEVOLUCIONES
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  &gt; CONTACTO
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-mono font-bold text-xs uppercase tracking-wider mb-4 border-b border-foreground/20 pb-2">
              [LEGAL]
            </h4>
            <ul className="space-y-2 text-xs font-mono text-foreground/70">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  &gt; TÉRMINOS
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  &gt; PRIVACIDAD
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  &gt; COOKIES
                </a>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-mono font-bold text-xs uppercase tracking-wider mb-4 border-b border-foreground/20 pb-2">
              [SOCIALS]
            </h4>
            <ul className="space-y-2 text-xs font-mono text-foreground/70">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  &gt; INSTAGRAM
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  &gt; TIKTOK
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  &gt; WHATSAPP
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Receipt-style bottom */}
        <div className="border-t border-foreground/20 mt-12 pt-6">
          <div className="font-mono text-[10px] text-foreground/50 text-center space-y-1">
            <p>================================</p>
            <p>© 2026 ETIQUETA ROJA</p>
            <p>BUENOS AIRES, ARGENTINA</p>
            <p>TODOS LOS DERECHOS RESERVADOS</p>
            <p>================================</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
