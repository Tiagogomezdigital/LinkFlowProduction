import { FileQuestion, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="flex justify-center mb-6">
          <div className="bg-slate-800 rounded-full p-4">
            <FileQuestion className="h-12 w-12 text-slate-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">Página não encontrada</h1>
        <p className="text-slate-400 mb-6">O grupo que você está procurando não existe ou foi removido.</p>

        <Button asChild className="bg-lime-400 hover:bg-lime-500 text-black">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Link>
        </Button>
      </div>
    </div>
  )
}
