import React from "react"
import { useStudent } from "@/context/StudentContext"
import { Input } from "@/components/ui/input"
import { IdCard, CheckCircle2, X } from "lucide-react"

export function StudentRegistrationHeaderInput() {
  const { studentId, setStudentId, clearStudentId, isValid } = useStudent()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 17)
    setStudentId(raw)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        <IdCard className="absolute left-2.5 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={17}
          placeholder="17-Digit Registration No."
          value={studentId}
          onChange={handleChange}
          aria-label="Student 17-digit Registration Number"
          className="h-9 w-52 sm:w-64 pl-8 pr-16 text-xs font-mono font-medium bg-background/80 placeholder:font-sans placeholder:text-muted-foreground/70 focus-visible:ring-primary"
        />

        {/* Right side inside input: status & clear */}
        <div className="absolute right-1.5 flex items-center gap-1">
          {studentId.length > 0 && studentId.length < 17 && (
            <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
              {studentId.length}/17
            </span>
          )}

          {isValid && (
            <span
              title="17-Digit Registration Number Active"
              className="flex items-center text-green-600 dark:text-green-400"
            >
              <CheckCircle2 className="size-4" />
            </span>
          )}

          {studentId.length > 0 && (
            <button
              type="button"
              onClick={clearStudentId}
              title="Clear Registration Number"
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
