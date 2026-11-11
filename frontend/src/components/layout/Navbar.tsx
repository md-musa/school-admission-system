import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, BookOpen, FileText } from "lucide-react"
import { StudentRegistrationHeaderInput } from "./StudentRegistrationHeaderInput"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { label: "Available Classes", path: "/", icon: BookOpen },
    { label: "My Applications", path: "/my-applications", icon: FileText },
  ]

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90">
          <img src="/logo.svg" alt="EduApply" className="size-7" />
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold tracking-tight text-foreground leading-tight">
              Edu<span className="text-primary">Apply</span>
            </span>
            <span className="text-[10px] text-muted-foreground leading-none">
              Admission Portal
            </span>
          </div>
        </Link>

        {/* Student Registration Number Input */}
        <div className="hidden lg:flex items-center">
          <StudentRegistrationHeaderInput />
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden sm:flex items-center gap-2">
          <nav className="flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => {
              const active = isActive(link.path)
              const Icon = link.icon

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-hidden"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Input row */}
      <div className="lg:hidden border-t border-border/50 px-4 py-2 bg-muted/20 flex justify-center">
        <StudentRegistrationHeaderInput />
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-border bg-background px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const active = isActive(link.path)
            const Icon = link.icon

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
