import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Database types
export interface Colaborador {
  id: number
  nome: string
  cracha: string
  codigo_acesso: string
  tentativas_codigo: number
  bloqueado: boolean
  ultimo_token_bloqueio: string | null
  criado_em: string
  atualizado_em: string
  data_nascimento: string
  cargo: string
  supervisor: string
  turno: string
  telefone: string
}

export interface HoraLancamento {
  id: number
  colaborador_id: number
  data_lancamento: string
  horas: number
  motivo: string | null
  criado_por: string
  criado_em: string
}

// Database operations
export const db = {
  // Find colaborador by cracha
  async findColaboradorByCracha(cracha: string): Promise<Colaborador | null> {
    try {
      const result = await sql`
        SELECT * FROM colaboradores WHERE cracha = ${cracha} LIMIT 1
      `
      return (result[0] as Colaborador) || null
    } catch (error) {
      console.error("Error finding colaborador by cracha:", error)
      return null
    }
  },

  // Find colaborador by id
  async findColaboradorById(id: number): Promise<Colaborador | null> {
    try {
      const result = await sql`
        SELECT * FROM colaboradores WHERE id = ${id} LIMIT 1
      `
      return (result[0] as Colaborador) || null
    } catch (error) {
      console.error("Error finding colaborador by id:", error)
      return null
    }
  },

  // Update colaborador tentativas
  async updateTentativas(id: number, tentativas: number) {
    try {
      await sql`
        UPDATE colaboradores 
        SET tentativas_codigo = ${tentativas}, atualizado_em = NOW()
        WHERE id = ${id}
      `
    } catch (error) {
      console.error("Error updating tentativas:", error)
      throw error
    }
  },

  // Block colaborador
  async blockColaborador(id: number, token: string) {
    try {
      await sql`
        UPDATE colaboradores 
        SET bloqueado = TRUE, 
            ultimo_token_bloqueio = ${token},
            atualizado_em = NOW()
        WHERE id = ${id}
      `
    } catch (error) {
      console.error("Error blocking colaborador:", error)
      throw error
    }
  },

  // Unblock colaborador
  async unblockColaborador(id: number, newCode: string) {
    try {
      await sql`
        UPDATE colaboradores 
        SET codigo_acesso = ${newCode}, 
            tentativas_codigo = 0,
            bloqueado = FALSE,
            ultimo_token_bloqueio = NULL,
            atualizado_em = NOW()
        WHERE id = ${id}
      `
    } catch (error) {
      console.error("Error unblocking colaborador:", error)
      throw error
    }
  },

  // Find colaborador by token
  async findColaboradorByToken(token: string): Promise<Colaborador | null> {
    try {
      const result = await sql`
        SELECT * FROM colaboradores WHERE ultimo_token_bloqueio = ${token} LIMIT 1
      `
      return (result[0] as Colaborador) || null
    } catch (error) {
      console.error("Error finding colaborador by token:", error)
      return null
    }
  },

  // Create time entry
  async createHoraLancamento(data: Omit<HoraLancamento, "id" | "data_lancamento" | "criado_em">) {
    try {
      const result = await sql`
        INSERT INTO hora_lancamentos (colaborador_id, horas, motivo, criado_por)
        VALUES (${data.colaborador_id}, ${data.horas}, ${data.motivo}, ${data.criado_por})
        RETURNING *
      `
      return result[0] as HoraLancamento
    } catch (error) {
      console.error("Error creating hora lancamento:", error)
      throw error
    }
  },

  // Get time entries for colaborador
  async getHorasLancamentos(colaboradorId: number): Promise<HoraLancamento[]> {
    try {
      const result = await sql`
        SELECT * FROM hora_lancamentos 
        WHERE colaborador_id = ${colaboradorId}
        ORDER BY data_lancamento DESC
      `
      return result as HoraLancamento[]
    } catch (error) {
      console.error("Error getting horas lancamentos:", error)
      return []
    }
  },

  // Calculate balance for colaborador
  async calculateBalance(colaboradorId: number): Promise<number> {
    try {
      const result = await sql`
        SELECT COALESCE(SUM(horas), 0) as saldo
        FROM hora_lancamentos 
        WHERE colaborador_id = ${colaboradorId}
      `
      return Number(result[0]?.saldo || 0)
    } catch (error) {
      console.error("Error calculating balance:", error)
      return 0
    }
  },

  // Get all colaboradores
  async getAllColaboradores(): Promise<Colaborador[]> {
    try {
      const result = await sql`
        SELECT * FROM colaboradores 
        ORDER BY nome ASC
      `
      return result as Colaborador[]
    } catch (error) {
      console.error("Error getting all colaboradores:", error)
      return []
    }
  },

  // Create new colaborador
  async createColaborador(data: {
    nome: string
    cracha: string
    codigoAcesso: string
    dataNascimento: string
    cargo: string
    supervisor: string
    turno: string
    telefone: string
  }): Promise<Colaborador> {
    try {
      const result = await sql`
        INSERT INTO colaboradores (nome, cracha, codigo_acesso, data_nascimento, cargo, supervisor, turno, telefone)
        VALUES (${data.nome}, ${data.cracha}, ${data.codigoAcesso}, ${data.dataNascimento}, ${data.cargo}, ${data.supervisor}, ${data.turno}, ${data.telefone})
        RETURNING *
      `
      return result[0] as Colaborador
    } catch (error) {
      console.error("Error creating colaborador:", error)
      throw error
    }
  },

  // Get all time entries with colaborador names
  async getAllHorasLancamentos(): Promise<(HoraLancamento & { colaborador_nome: string })[]> {
    try {
      const result = await sql`
        SELECT hl.*, c.nome as colaborador_nome
        FROM hora_lancamentos hl
        JOIN colaboradores c ON hl.colaborador_id = c.id
        ORDER BY hl.data_lancamento DESC
      `
      return result as (HoraLancamento & { colaborador_nome: string })[]
    } catch (error) {
      console.error("Error getting all horas lancamentos:", error)
      return []
    }
  },
}
