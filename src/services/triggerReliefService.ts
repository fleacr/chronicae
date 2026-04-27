import { supabase } from './supabaseClient'

export interface TriggerReliefEntry {
  id?: string
  user_id: string
  type: 'trigger' | 'relief'
  description: string
  date: string // YYYY-MM-DD (local)
  created_at?: string
  updated_at?: string
}

// Helper: YYYY-MM-DD (local)
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper: local timestamp
const getLocalTimestamp = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

export class TriggerReliefService {
  // ✅ SIEMPRE inserta (permite múltiples entradas por día)
  static async saveTriggerRelief(
    userId: string,
    type: 'trigger' | 'relief',
    description: string,
    date?: string
  ) {
    try {
      const localTimestamp = getLocalTimestamp()

      const { data, error } = await supabase
        .from('trigger_relief')
        .insert([
          {
            user_id: userId,
            type,
            description,
            date: date || getLocalDateString(new Date()),
            created_at: localTimestamp,
            updated_at: localTimestamp
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error saving trigger/relief entry:', error)
      throw error
    }
  }

  // Obtener múltiples entries
  static async getTriggerReliefEntries(
    userId: string,
    type?: 'trigger' | 'relief',
    limit = 30
  ) {
    try {
      let query = supabase
        .from('trigger_relief')
        .select('*')
        .eq('user_id', userId)

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error } = await query
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching trigger/relief entries:', error)
      throw error
    }
  }

  // Obtener entries por fecha (pueden ser varios)
  static async getTriggerReliefByDate(userId: string, date: string) {
    try {
      const { data, error } = await supabase
        .from('trigger_relief')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching entries by date:', error)
      throw error
    }
  }

  // ⚠️ Ahora puede devolver varios (antes asumías uno)
  static async getTriggerReliefByTypeAndDate(
    userId: string,
    type: 'trigger' | 'relief',
    date: string
  ) {
    try {
      const { data, error } = await supabase
        .from('trigger_relief')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .eq('date', date)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data // ← ahora es array
    } catch (error) {
      console.error('Error fetching trigger/relief entries:', error)
      throw error
    }
  }

  // Delete por id
  static async deleteTriggerRelief(id: string) {
    try {
      const { error } = await supabase
        .from('trigger_relief')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting trigger/relief entry:', error)
      throw error
    }
  }

  // Update específico por id
  static async updateTriggerRelief(
    id: string,
    data: Partial<TriggerReliefEntry>
  ) {
    try {
      const { data: entry, error } = await supabase
        .from('trigger_relief')
        .update({
          ...data,
          updated_at: getLocalTimestamp()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return entry
    } catch (error) {
      console.error('Error updating trigger/relief entry:', error)
      throw error
    }
  }
}