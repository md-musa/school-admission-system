import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GraduationCap, ArrowRight, Sparkles } from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClassStatusBadge } from "./ClassStatusBadge"
import { SeatAvailability } from "./SeatAvailability"
import { AdmissionApplicationForm } from "@/components/admission/AdmissionApplicationForm"

export interface ClassData {
  id: string
  name: string
  totalSeats: number
  heldSeats: number
  confirmedSeats: number
  availableSeats: number
}

interface ClassCardProps {
  cls: ClassData
}

export function ClassCard({ cls }: ClassCardProps) {
  const navigate = useNavigate()
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const isFull = cls.availableSeats <= 0

  return (
    <>
      <Card className="flex flex-col border border-border/80 shadow-xs hover:shadow-sm transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <GraduationCap
                className="mt-0.5 shrink-0 text-primary"
                size={18}
              />
              <div>
                <CardTitle className="text-base leading-snug">{cls.name}</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Independent Shift &amp; Capacity
                </p>
              </div>
            </div>
            <ClassStatusBadge
              availableSeats={cls.availableSeats}
              totalSeats={cls.totalSeats}
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-4">
          <SeatAvailability
            totalSeats={cls.totalSeats}
            heldSeats={cls.heldSeats}
            confirmedSeats={cls.confirmedSeats}
            availableSeats={cls.availableSeats}
          />
        </CardContent>

        <CardFooter className="pt-0 flex flex-col gap-2">
          {/* Primary Action: "Apply Now" Button */}
          <Button
            className="w-full gap-1.5"
            variant={isFull ? "outline" : "default"}
            disabled={isFull}
            onClick={() => setIsApplyOpen(true)}
            aria-label={
              isFull
                ? `${cls.name} is full`
                : `Apply Now for ${cls.name}`
            }
          >
            {isFull ? (
              "Class Full"
            ) : (
              <>
                <Sparkles className="size-4" />
                <span>Apply Now</span>
              </>
            )}
          </Button>

          {/* Secondary Action: View Details */}
          <button
            type="button"
            onClick={() => navigate(`/classes/${cls.id}`)}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1 transition-colors py-1"
          >
            <span>View Details</span>
            <ArrowRight className="size-3" />
          </button>
        </CardFooter>
      </Card>

      {/* Direct Apply Modal */}
      <AdmissionApplicationForm
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        classId={cls.id}
        classNameTitle={cls.name}
      />
    </>
  )
}
