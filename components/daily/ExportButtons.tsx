'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function ExportButtons() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" className="border-slate-600 flex gap-2">
        <Download className="h-4 w-4" />
        Exportar CSV
      </Button>
      <Button variant="outline" className="border-slate-600 flex gap-2">
        <Download className="h-4 w-4" />
        Exportar PNG
      </Button>
    </div>
  )
} 