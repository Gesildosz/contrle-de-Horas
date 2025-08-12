"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Users, Clock, UserPlus, AlertTriangle, CheckCircle, Unlock, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface Colaborador {
  id: number
  nome: string
  cracha: string
  bloqueado: boolean
  tentativas_codigo: number
  ultimo_token_bloqueio?: string
  dataNascimento: string
  cargo: string
  supervisor: string
  turno: string
  telefone: string
}

interface HoraLancamento {
  id: number
  colaborador_id: number
  colaborador_nome: string
  data_lancamento: string
  horas: number
  motivo: string
  criado_por: string
}

export default function AdminPage() {
  const router = useRouter()
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [historico, setHistorico] = useState<HoraLancamento[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form states
  const [novoColaborador, setNovoColaborador] = useState({
    nome: "",
    cracha: "",
    codigoAcesso: "",
    dataNascimento: "",
    cargo: "",
    supervisor: "",
    turno: "",
    telefone: "+55 ",
  })

  const [lancamentoHoras, setLancamentoHoras] = useState({
    colaboradorId: "",
    horas: "",
    motivo: "",
    criadoPor: "Administrador",
  })

  const [tokenDesbloqueio, setTokenDesbloqueio] = useState({
    token: "",
    novoCodigoAcesso: "",
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const [colaboradoresRes, historicoRes] = await Promise.all([
        fetch("/api/admin/colaboradores"),
        fetch("/api/admin/historico"),
      ])

      if (colaboradoresRes.ok) {
        const colaboradoresData = await colaboradoresRes.json()
        setColaboradores(colaboradoresData)
      }

      if (historicoRes.ok) {
        const historicoData = await historicoRes.json()
        setHistorico(historicoData)
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err)
    }
  }

  const cadastrarColaborador = async () => {
    if (
      !novoColaborador.nome ||
      !novoColaborador.cracha ||
      !novoColaborador.codigoAcesso ||
      !novoColaborador.dataNascimento ||
      !novoColaborador.cargo ||
      !novoColaborador.supervisor ||
      !novoColaborador.turno ||
      !novoColaborador.telefone
    ) {
      setError("Todos os campos são obrigatórios")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/colaboradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoColaborador),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Colaborador cadastrado com sucesso!")
        setNovoColaborador({
          nome: "",
          cracha: "",
          codigoAcesso: "",
          dataNascimento: "",
          cargo: "",
          supervisor: "",
          turno: "",
          telefone: "+55 ",
        })
        carregarDados()
      } else {
        setError(data.error || "Erro ao cadastrar colaborador")
      }
    } catch (err) {
      setError("Erro ao cadastrar colaborador")
    } finally {
      setLoading(false)
    }
  }

  const lancarHoras = async () => {
    if (!lancamentoHoras.colaboradorId || !lancamentoHoras.horas) {
      setError("Colaborador e horas são obrigatórios")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/horas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          colaboradorId: Number.parseInt(lancamentoHoras.colaboradorId),
          horas: Number.parseInt(lancamentoHoras.horas),
          motivo: lancamentoHoras.motivo,
          criadoPor: lancamentoHoras.criadoPor,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Horas lançadas com sucesso!")
        setLancamentoHoras({ colaboradorId: "", horas: "", motivo: "", criadoPor: "Administrador" })
        carregarDados()
      } else {
        setError(data.error || "Erro ao lançar horas")
      }
    } catch (err) {
      setError("Erro ao lançar horas")
    } finally {
      setLoading(false)
    }
  }

  const desbloquearColaborador = async () => {
    if (!tokenDesbloqueio.token || !tokenDesbloqueio.novoCodigoAcesso) {
      setError("Token e novo código são obrigatórios")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/desbloquear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokenDesbloqueio),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Colaborador desbloqueado com sucesso!")
        setTokenDesbloqueio({ token: "", novoCodigoAcesso: "" })
        carregarDados()
      } else {
        setError(data.error || "Erro ao desbloquear colaborador")
      }
    } catch (err) {
      setError("Erro ao desbloquear colaborador")
    } finally {
      setLoading(false)
    }
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

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            </div>
            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
          <p className="text-gray-600">Gerenciamento do sistema de banco de horas</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="colaboradores" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colaboradores" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Colaboradores
            </TabsTrigger>
            <TabsTrigger value="cadastro" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Cadastro
            </TabsTrigger>
            <TabsTrigger value="horas" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Lançar Horas
            </TabsTrigger>
            <TabsTrigger value="desbloqueio" className="flex items-center gap-2">
              <Unlock className="h-4 w-4" />
              Desbloqueio
            </TabsTrigger>
          </TabsList>

          {/* Colaboradores Tab */}
          <TabsContent value="colaboradores">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Colaboradores</CardTitle>
                <CardDescription>Visualize todos os colaboradores cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {colaboradores.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum colaborador cadastrado</p>
                  ) : (
                    <div className="grid gap-4">
                      {colaboradores.map((colaborador) => (
                        <div key={colaborador.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-semibold">{colaborador.nome}</p>
                              <p className="text-sm text-gray-600">Crachá: {colaborador.cracha}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {colaborador.bloqueado ? (
                              <Badge variant="destructive">Bloqueado</Badge>
                            ) : (
                              <Badge variant="default">Ativo</Badge>
                            )}
                            {colaborador.tentativas_codigo > 0 && (
                              <Badge variant="outline">{colaborador.tentativas_codigo}/3 tentativas</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cadastro Tab */}
          <TabsContent value="cadastro">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Novo Colaborador</CardTitle>
                <CardDescription>Adicione um novo colaborador ao sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={novoColaborador.nome}
                      onChange={(e) => setNovoColaborador({ ...novoColaborador, nome: e.target.value })}
                      placeholder="Ex: João Silva Santos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cracha">Número do Crachá *</Label>
                    <Input
                      id="cracha"
                      value={novoColaborador.cracha}
                      onChange={(e) => setNovoColaborador({ ...novoColaborador, cracha: e.target.value })}
                      placeholder="Ex: 001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      value={novoColaborador.dataNascimento}
                      onChange={(e) => setNovoColaborador({ ...novoColaborador, dataNascimento: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={novoColaborador.telefone}
                      onChange={(e) => setNovoColaborador({ ...novoColaborador, telefone: e.target.value })}
                      placeholder="+55 (11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo *</Label>
                    <select
                      id="cargo"
                      className="w-full p-2 border rounded-md bg-white"
                      value={novoColaborador.cargo}
                      onChange={(e) => setNovoColaborador({ ...novoColaborador, cargo: e.target.value })}
                    >
                      <option value="">Escolha uma opção</option>
                      <option value="Operador Empilhadeira">Operador Empilhadeira</option>
                      <option value="Operador de Transpaleteira">Operador de Transpaleteira</option>
                      <option value="Auxiliar">Auxiliar</option>
                      <option value="Conferente II">Conferente II</option>
                      <option value="Conferente I">Conferente I</option>
                      <option value="Portaria">Portaria</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Controlador">Controlador</option>
                      <option value="Assistente Administrativo">Assistente Administrativo</option>
                      <option value="Analista Jr">Analista Jr</option>
                      <option value="Assistente">Assistente</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supervisor">Supervisor *</Label>
                    <select
                      id="supervisor"
                      className="w-full p-2 border rounded-md bg-white"
                      value={novoColaborador.supervisor}
                      onChange={(e) => setNovoColaborador({ ...novoColaborador, supervisor: e.target.value })}
                    >
                      <option value="">Escolha uma opção</option>
                      <option value="Welton Andrade">Welton Andrade</option>
                      <option value="Arlem Brito">Arlem Brito</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="turno">Turno *</Label>
                    <select
                      id="turno"
                      className="w-full p-2 border rounded-md bg-white"
                      value={novoColaborador.turno}
                      onChange={(e) => setNovoColaborador({ ...novoColaborador, turno: e.target.value })}
                    >
                      <option value="">Escolha uma opção</option>
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noite">Noite</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codigoAcesso">Código de Acesso *</Label>
                    <Input
                      id="codigoAcesso"
                      type="password"
                      value={novoColaborador.codigoAcesso}
                      onChange={(e) => setNovoColaborador({ ...novoColaborador, codigoAcesso: e.target.value })}
                      placeholder="Digite o código de acesso"
                    />
                  </div>
                </div>

                <Button onClick={cadastrarColaborador} disabled={loading} className="w-full">
                  {loading ? "Cadastrando..." : "Cadastrar Colaborador"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lançar Horas Tab */}
          <TabsContent value="horas">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lançar Horas</CardTitle>
                  <CardDescription>Registre horas trabalhadas ou ajustes para colaboradores</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="colaborador">Colaborador</Label>
                      <select
                        id="colaborador"
                        className="w-full p-2 border rounded-md"
                        value={lancamentoHoras.colaboradorId}
                        onChange={(e) => setLancamentoHoras({ ...lancamentoHoras, colaboradorId: e.target.value })}
                      >
                        <option value="">Selecione um colaborador</option>
                        {colaboradores.map((colaborador) => (
                          <option key={colaborador.id} value={colaborador.id}>
                            {colaborador.nome} - Crachá {colaborador.cracha}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="horas">Horas (use - para negativo)</Label>
                      <Input
                        id="horas"
                        type="number"
                        value={lancamentoHoras.horas}
                        onChange={(e) => setLancamentoHoras({ ...lancamentoHoras, horas: e.target.value })}
                        placeholder="Ex: 8 ou -2"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motivo">Motivo (opcional)</Label>
                    <Textarea
                      id="motivo"
                      value={lancamentoHoras.motivo}
                      onChange={(e) => setLancamentoHoras({ ...lancamentoHoras, motivo: e.target.value })}
                      placeholder="Descreva o motivo do lançamento..."
                    />
                  </div>
                  <Button onClick={lancarHoras} disabled={loading} className="w-full">
                    {loading ? "Lançando..." : "Lançar Horas"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Histórico Recente</CardTitle>
                  <CardDescription>Últimos lançamentos realizados</CardDescription>
                </CardHeader>
                <CardContent>
                  {historico.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum lançamento encontrado</p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {historico.slice(0, 10).map((item) => (
                        <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.colaborador_nome}</p>
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
            </div>
          </TabsContent>

          {/* Desbloqueio Tab */}
          <TabsContent value="desbloqueio">
            <Card>
              <CardHeader>
                <CardTitle>Desbloquear Colaborador</CardTitle>
                <CardDescription>Use o token fornecido pelo colaborador para desbloqueá-lo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="token">Token de Desbloqueio</Label>
                    <Input
                      id="token"
                      value={tokenDesbloqueio.token}
                      onChange={(e) =>
                        setTokenDesbloqueio({ ...tokenDesbloqueio, token: e.target.value.toUpperCase() })
                      }
                      placeholder="Ex: A1B2C3D4"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="novoCodigoAcesso">Novo Código de Acesso</Label>
                    <Input
                      id="novoCodigoAcesso"
                      type="password"
                      value={tokenDesbloqueio.novoCodigoAcesso}
                      onChange={(e) => setTokenDesbloqueio({ ...tokenDesbloqueio, novoCodigoAcesso: e.target.value })}
                      placeholder="Digite o novo código"
                    />
                  </div>
                </div>
                <Button onClick={desbloquearColaborador} disabled={loading} className="w-full">
                  {loading ? "Desbloqueando..." : "Desbloquear Colaborador"}
                </Button>

                {/* Lista de colaboradores bloqueados */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Colaboradores Bloqueados</h3>
                  {colaboradores.filter((c) => c.bloqueado).length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhum colaborador bloqueado</p>
                  ) : (
                    <div className="space-y-2">
                      {colaboradores
                        .filter((c) => c.bloqueado)
                        .map((colaborador) => (
                          <div
                            key={colaborador.id}
                            className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{colaborador.nome}</p>
                              <p className="text-sm text-gray-600">Crachá: {colaborador.cracha}</p>
                            </div>
                            {colaborador.ultimo_token_bloqueio && (
                              <Badge variant="outline" className="font-mono">
                                {colaborador.ultimo_token_bloqueio}
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
