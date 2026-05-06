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
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary">
          Registro de cierre
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Activity selector */}
          <div className="space-y-2">
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              ¿Cómo funcionó?
            </label>
            <div className="flex gap-2">
              {feedbackOptions.map((option) => {
                const Icon = option.icon
                const isSelected = feedback === option.value
                return (
                  <Button
                    key={option.value}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`flex-1 h-11 text-xs ${
                      isSelected ? option.color : ""
                    }`}
                    onClick={() => setFeedback(option.value)}
                  >
                    <Icon className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Save button */}
        <Button 
          className="w-full h-12 text-base font-medium" 
          size="lg"
          disabled={!activity || !feedback}
        >
          <Save className="w-5 h-5 mr-2" />
          Guardar registro
        </Button>
      </CardContent>
    </Card>
  )
}
