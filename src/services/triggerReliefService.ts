import { supabase } from './supabaseClient'

export interface TriggerReliefEntry {
  id?: string
  user_id: string
  type: 'trigger' | 'relief'
  description: string
  date: string // YYYY-MM-DD in local time
  created_at?: string
  updated_at?: string
}

// Helper function to convert Date to local YYYY-MM-DD string
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper function to get local timestamp (not UTC)
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
  static async saveTriggerRelief(
    userId: string,
    type: 'trigger' | 'relief',
    description: string,
    date: string
  ) {
    try {
      // Check if entry already exists for this type and date
      const { data: existingEntries, error: fetchError } = await supabase
        .from('trigger_relief')
        .select('id')
        .eq('user_id', userId)
        .eq('type', type)
        .eq('date', date)

      if (fetchError) {
        throw fetchError
      }

      if (existingEntries && existingEntries.length > 0) {
        // Update existing entry
        const { data: entries, error } = await supabase
          .from('trigger_relief')
          .update({
            description,
            updated_at: getLocalTimestamp()
          })
          .eq('id', existingEntries[0].id)
          .select()

        if (error) {
          console.error('Update error:', error)
          throw error
        }
        return entries?.[0] || null
      } else {
        // Insert new entry
        const localTimestamp = getLocalTimestamp()
        const { data: entries, error } = await supabase
          .from('trigger_relief')
          .insert([
            {
              user_id: userId,
              type,
              description,
              date,
              created_at: localTimestamp,
              updated_at: localTimestamp
            }
          ])
          .select()

        if (error) {
          console.error('Insert error:', error)
          throw error
        }
        return entries?.[0] || null
      }
    } catch (error) {
      console.error('Error saving trigger/relief entry:', error)
      throw error
    }
  }

  static async getTriggerReliefEntries(userId: string, type?: 'trigger' | 'relief', limit = 30) {
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

  static async getTriggerReliefByDate(userId: string, date: string) {
    try {
      const { data, error } = await supabase
        .from('trigger_relief')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('type')

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching entries by date:', error)
      throw error
    }
  }

  static async getTriggerReliefEntryByTypeAndDate(userId: string, type: 'trigger' | 'relief', date: string) {
    try {
      const { data, error } = await supabase
        .from('trigger_relief')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .eq('date', date)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is fine
        throw error
      }

      return data || null
    } catch (error) {
      console.error('Error fetching trigger/relief entry:', error)
      throw error
    }
  }

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

  static async updateTriggerRelief(id: string, data: Partial<TriggerReliefEntry>) {
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
