import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href: string
  active?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-4 w-4 text-slate-600" />}
          {item.active ? (
            <span className="text-slate-500 font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="text-slate-500 hover:text-white transition-colors">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
