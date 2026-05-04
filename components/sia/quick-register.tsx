"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, ThumbsUp, Minus, AlertCircle } from "lucide-react"

type FeedbackType = "good" | "partial" | "needs-adjustment" | null

export function QuickRegister() {
  const [activity, setActivity] = useState<string>("")
  const [feedback, setFeedback] = useState<FeedbackType>(null)

  const feedbackOptions = [
    { value: "good", label: "Funcionó bien", icon: ThumbsUp, color: "bg-status-green text-white" },
    { value: "partial", label: "Parcialmente", icon: Minus, color: "bg-status-yellow text-white" },
    { value: "needs-adjustment", label: "Necesita ajuste", icon: AlertCircle, color: "bg-status-red text-white" },
  ] as const

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary">
          Registro de cierre
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col gap-4 flex-1">
        {/* Activity selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Actividad realizada
          </label>
          <Select value={activity} onValueChange={setActivity}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Seleccionar actividad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sound-p">Sonido /p/ - Identificación</SelectItem>
              <SelectItem value="syllables">Segmentación silábica</SelectItem>
              <SelectItem value="letter-recognition">Reconocimiento de letras</SelectItem>
              <SelectItem value="oral-expression">Expresión oral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Feedback buttons */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            ¿Cómo funcionó?
          </label>
          <div className="flex flex-wrap gap-2">
            {feedbackOptions.map((option) => {
              const Icon = option.icon
              const isSelected = feedback === option.value
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`flex-1 min-w-[7rem] h-11 text-xs gap-1.5 ${
                    isSelected ? option.color : ""
                  }`}
                  onClick={() => setFeedback(option.value)}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{option.label}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Save button — pinned to bottom */}
        <div className="mt-auto pt-1">
          <Button
            className="w-full h-12 text-base font-medium"
            size="lg"
            disabled={!activity || !feedback}
          >
            <Save className="w-5 h-5 mr-2" />
            Guardar registro
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
