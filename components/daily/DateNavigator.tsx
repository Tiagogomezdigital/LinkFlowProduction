'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useState } from 'react'

type Props = {
  date: Date
  onDateChange: (d: Date) => void
  onPrev: () => void
  onNext: () => void
}

export function DateNavigator({ date, onDateChange, onPrev, onNext }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <h1 className="text-3xl font-bold text-white flex-1">Resumo Diário</h1>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrev} className="border-slate-600">
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex gap-2 border-slate-600">
              <CalendarIcon className="h-4 w-4" />
              {format(date, 'dd/MM/yyyy', { locale: ptBR })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 bg-slate-800 border-slate-700">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) onDateChange(d)
                setOpen(false)
              }}
              locale={ptBR}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="icon" onClick={onNext} className="border-slate-600">
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 