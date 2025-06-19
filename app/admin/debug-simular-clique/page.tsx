"use client"

import { useState } from "react"
import { registerClick } from "@/lib/api/groups"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function DebugSimularCliquePage() {
  const [groupSlug, setGroupSlug] = useState("")
  const [numberPhone, setNumberPhone] = useState("")
  const [logs, setLogs] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const log = (msg: string) => setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])

  const handleSimulateClick = async () => {
    setLogs([])
    setResult(null)
    setLoading(true)
    log("Iniciando simulação de clique...")

    try {
      log(`Enviando para registerClick: groupSlug='${groupSlug}', numberPhone='${numberPhone}'`)
      await registerClick({
        groupSlug,
        numberPhone,
        ipAddress: "127.0.0.1",
        userAgent: "Simulador/1.0",
        deviceType: "desktop",
        referrer: "https://localhost/debug"
      })
      log("Clique registrado com sucesso!")
      setResult({ success: true })
    } catch (error: any) {
      log(`Erro ao registrar clique: ${JSON.stringify(error, null, 2)}`)
      setResult({ success: false, error: error })
    } finally {
      setLoading(false)
      log("Simulação finalizada.")
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4 text-white">Simulador de Clique (Debug)</h1>
      <div className="space-y-4 bg-slate-800 p-6 rounded-lg border border-slate-700">
        <div>
          <label className="block text-slate-300 mb-1">Slug do Grupo</label>
          <Input
            value={groupSlug}
            onChange={e => setGroupSlug(e.target.value)}
            placeholder="ex: suporte-tecnico"
            className="mb-2"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-1">Telefone do Número</label>
          <Input
            value={numberPhone}
            onChange={e => setNumberPhone(e.target.value)}
            placeholder="ex: +5511999999999"
            className="mb-2"
          />
        </div>
        <Button onClick={handleSimulateClick} disabled={loading || !groupSlug || !numberPhone}>
          {loading ? "Simulando..." : "Simular Clique"}
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-2">Logs & Debug</h2>
        <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-lg min-h-[120px] max-h-60 overflow-y-auto border border-slate-700">
          {logs.length === 0 ? <span className="text-slate-500">Nenhum log ainda.</span> : logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
        {result && (
          <div className="mt-4">
            <h3 className="text-base font-bold text-white">Resultado:</h3>
            <pre className="bg-slate-900 text-lime-400 p-3 rounded">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
        <div className="mt-8">
          <h3 className="text-base font-bold text-white mb-2">SQLs úteis para depuração:</h3>
          <pre className="bg-slate-900 text-slate-200 p-3 rounded text-xs overflow-x-auto">
{`-- Verificar se o grupo existe e está ativo
SELECT * FROM groups WHERE slug = '<slug>' AND is_active = true;

-- Verificar se o número existe e está ativo para o grupo
SELECT * FROM whatsapp_numbers WHERE phone = '<telefone>' AND group_id = (SELECT id FROM groups WHERE slug = '<slug>');

-- Verificar cliques registrados para o grupo
SELECT * FROM clicks WHERE group_id = (SELECT id FROM groups WHERE slug = '<slug>') ORDER BY created_at DESC LIMIT 10;
`}
          </pre>
        </div>
      </div>
    </div>
  )
} 