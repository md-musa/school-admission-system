import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/60 text-card-foreground mt-16 sm:mt-24">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="EduApply" className="size-5" />
              <span className="font-heading text-base font-bold tracking-tight text-foreground">
                Edu<span className="text-primary">Apply</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Online School Admission &amp; Seat Reservation Portal
            </p>
          </div>

          {/* Quick Links */}
          <nav className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Available Classes
            </Link>
            <Link to="/my-applications" className="hover:text-foreground transition-colors">
              My Applications
            </Link>
          </nav>
        </div>

        {/* Bottom line */}
        <div className="mt-6 border-t border-border/50 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© 2026 EduApply. All rights reserved.</p>
          <p className="text-[11px] text-muted-foreground/70">
            A simple, transparent admission experience.
          </p>
        </div>
      </div>
    </footer>
  )
}
