"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Clock, User, AlertTriangle, CheckCircle } from "lucide-react"

type AuthStep = "badge" | "code" | "dashboard" | "blocked"

interface Colaborador {
  id: number
  nome: string
  cracha: string
}

interface HoraLancamento {
  id: number
  data_lancamento: string
  horas: number
  motivo: string
  criado_por: string
}

export default function HomePage() {
  const [step, setStep] = useState<AuthStep>("badge")
  const [cracha, setCracha] = useState("")
  const [codigo, setCodigo] = useState("")
  const [colaborador, setColaborador] = useState<Colaborador | null>(null)
  const [saldo, setSaldo] = useState(0)
  const [historico, setHistorico] = useState<HoraLancamento[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState("")

  const verificarCracha = async () => {
    if (!cracha.trim()) {
      setError("Digite o número do crachá")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/colaborador/verifica-cracha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cracha: cracha.trim() }),
      })

      const data = await response.json()

      if (data.ok) {
        setColaborador({ id: data.colaboradorId, nome: data.nome, cracha })
        setStep("code")
      } else {
        setError(data.error || "Crachá não encontrado")
      }
    } catch (err) {
      setError("Erro ao verificar crachá. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const verificarCodigo = async () => {
    if (!codigo.trim()) {
      setError("Digite o código de acesso")
      return
    }

    if (!colaborador) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/colaborador/verifica-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          colaboradorId: colaborador.id,
          codigoAcesso: codigo.trim(),
        }),
      })

      const data = await response.json()

      if (data.ok) {
        await carregarDados()
        setStep("dashboard")
      } else {
        setError(data.error || "Código incorreto")
        if (data.token) {
          setToken(data.token)
          setStep("blocked")
        }
      }
    } catch (err) {
      setError("Erro ao verificar código. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const carregarDados = async () => {
    if (!colaborador) return

    try {
      const response = await fetch(`/api/colaborador/${colaborador.id}/banco`)
      const data = await response.json()
      setSaldo(data.saldo || 0)
      setHistorico(data.historico || [])
    } catch (err) {
      console.error("Erro ao carregar dados:", err)
    }
  }

  const reiniciar = () => {
    setStep("badge")
    setCracha("")
    setCodigo("")
    setColaborador(null)
    setSaldo(0)
    setHistorico([])
    setError("")
    setToken("")
  }

  const formatarHoras = (horas: number) => {
    const sinal = horas >= 0 ? "+" : ""
    return `${sinal}${horas}h`
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Clock className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Banco de Horas</h1>
          <p className="text-gray-600">Sistema de controle de horas trabalhadas</p>
        </div>

        {/* Step 1: Badge Verification */}
        {step === "badge" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Identificação
              </CardTitle>
              <CardDescription>Digite o número do seu crachá para continuar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cracha">Número do Crachá</Label>
                <Input
                  id="cracha"
                  type="text"
                  placeholder="Ex: 001"
                  value={cracha}
                  onChange={(e) => setCracha(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && verificarCracha()}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={verificarCracha} className="w-full" disabled={loading}>
                {loading ? "Verificando..." : "Continuar"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Code Verification */}
        {step === "code" && colaborador && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Olá, {colaborador.nome}
              </CardTitle>
              <CardDescription>Digite seu código de acesso para entrar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código de Acesso</Label>
                <Input
                  id="codigo"
                  type="password"
                  placeholder="Digite seu código"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && verificarCodigo()}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={reiniciar} className="flex-1 bg-transparent">
                  Voltar
                </Button>
                <Button onClick={verificarCodigo} className="flex-1" disabled={loading}>
                  {loading ? "Verificando..." : "Entrar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Blocked */}
        {step === "blocked" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Acesso Bloqueado
              </CardTitle>
              <CardDescription>Muitas tentativas incorretas. Procure o administrador.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 mb-2">
                  <strong>Token de desbloqueio:</strong>
                </p>
                <div className="bg-white p-2 rounded border font-mono text-lg text-center">{token}</div>
                <p className="text-xs text-red-600 mt-2">
                  Informe este token ao administrador para desbloquear seu acesso
                </p>
              </div>

              <Button variant="outline" onClick={reiniciar} className="w-full bg-transparent">
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Dashboard */}
        {step === "dashboard" && colaborador && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Olá, {colaborador.nome}</span>
                  <Badge variant="outline">Crachá {colaborador.cracha}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Saldo Atual</p>
                  <p className={`text-3xl font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatarHoras(saldo)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Lançamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {historico.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhum lançamento encontrado</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {historico.map((item) => (
                      <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">{formatarData(item.data_lancamento)}</p>
                          {item.motivo && <p className="text-sm text-gray-800 mt-1">{item.motivo}</p>}
                          <p className="text-xs text-gray-500 mt-1">Por: {item.criado_por}</p>
                        </div>
                        <Badge variant={item.horas >= 0 ? "default" : "destructive"} className="ml-2">
                          {formatarHoras(item.horas)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button variant="outline" onClick={reiniciar} className="w-full bg-transparent">
              Sair
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
