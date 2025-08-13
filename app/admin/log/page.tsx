"use client";
import { useEffect, useRef, useState } from "react";

interface LogEntry {
  type: "log" | "error" | "warn";
  message: any[];
  timestamp: string;
}

export default function LogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [paused, setPaused] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Garantir que estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Só interceptar logs no cliente
    if (!isClient) return;
    
    // Intercepta os logs do console
    const origLog = console.log;
    const origError = console.error;
    const origWarn = console.warn;

    function addLog(type: LogEntry["type"], ...message: any[]) {
      if (!paused) {
        setLogs((prev) => [
          ...prev,
          {
            type,
            message,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    }

    console.log = (...args) => {
      addLog("log", ...args);
      origLog(...args);
    };
    console.error = (...args) => {
      addLog("error", ...args);
      origError(...args);
    };
    console.warn = (...args) => {
      addLog("warn", ...args);
      origWarn(...args);
    };

    return () => {
      console.log = origLog;
      console.error = origError;
      console.warn = origWarn;
    };
  }, [paused, isClient]);

  useEffect(() => {
    if (isClient && !paused && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, paused, isClient]);

  // Mostrar loading enquanto não estiver no cliente
  if (!isClient) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Log do Sistema (Frontend)</h1>
        <div className="bg-black text-white rounded p-4 h-[60vh] overflow-y-auto border border-slate-700 text-sm font-mono flex items-center justify-center">
          <div className="text-slate-400">Carregando interceptador de logs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Log do Sistema (Frontend)</h1>
      <div className="flex gap-2 mb-4">
        <button
          className="px-3 py-1 bg-lime-600 text-white rounded hover:bg-lime-700"
          onClick={() => setLogs([])}
        >
          Limpar logs
        </button>
        <button
          className={`px-3 py-1 rounded ${paused ? "bg-yellow-500" : "bg-slate-700 text-white"}`}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? "Retomar" : "Pausar"}
        </button>
      </div>
      <div className="bg-black text-white rounded p-4 h-[60vh] overflow-y-auto border border-slate-700 text-sm font-mono">
        {logs.map((log, i) => (
          <div key={i} className={
            log.type === "error"
              ? "text-red-400"
              : log.type === "warn"
              ? "text-yellow-400"
              : "text-lime-400"
          }>
            <span className="text-slate-500">[{log.timestamp}]</span> {log.message.map((m, j) => typeof m === "object" ? JSON.stringify(m) : String(m)).join(" ")}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
      <p className="mt-4 text-xs text-slate-400">Logs capturados apenas do frontend desta aba. Recarregue para reiniciar a captura.</p>
    </div>
  );
}