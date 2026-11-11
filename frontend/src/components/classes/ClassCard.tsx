import { useNavigate } from "react-router-dom"
import { GraduationCap } from "lucide-react"
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
  const isFull = cls.availableSeats <= 0

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <GraduationCap
              className="mt-0.5 shrink-0 text-muted-foreground"
              size={18}
            />
            <CardTitle className="text-base leading-snug">{cls.name}</CardTitle>
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

      <CardFooter className="pt-0">
        <Button
          className="w-full"
          variant={isFull ? "outline" : "default"}
          disabled={isFull}
          onClick={() => navigate(`/classes/${cls.id}`)}
          aria-label={
            isFull
              ? `${cls.name} is full`
              : `View details for ${cls.name}`
          }
        >
          {isFull ? "Class Full" : "View Details"}
        </Button>
      </CardFooter>
    </Card>
  )
}
