import { supabase } from './supabaseClient'

export interface PainLogEntry {
  id?: string
  user_id: string
  pain_level: number
  description: string
  tags: string[]
  created_at?: string
}

export class PainLogService {
  static async savePainLog(userId: string, data: Omit<PainLogEntry, 'id' | 'user_id' | 'created_at'>) {
    try {
      // Get today's date range
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Check if there's already an entry for today
      const { data: existingEntries, error: fetchError } = await supabase
        .from('pain_logs')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())

      if (fetchError) {
        throw fetchError
      }

      if (existingEntries && existingEntries.length > 0) {
        // Update existing entry for today
        const { data: entries, error } = await supabase
          .from('pain_logs')
          .update({
            pain_level: data.pain_level,
            description: data.description,
            tags: data.tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntries[0].id)
          .select()

        if (error) throw error
        return entries?.[0] || null
      } else {
        // Insert new entry
        const { data: entries, error } = await supabase
          .from('pain_logs')
          .insert([
            {
              user_id: userId,
              pain_level: data.pain_level,
              description: data.description,
              tags: data.tags,
              created_at: today.toISOString()
            }
          ])
          .select()

        if (error) throw error
        return entries?.[0] || null
      }
    } catch (error) {
      console.error('Error saving pain log:', error)
      throw error
    }
  }

  static async getPainLogs(userId: string, limit = 30) {
    try {
      const { data, error } = await supabase
        .from('pain_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching pain logs:', error)
      throw error
    }
  }

  static async getPainLogById(id: string) {
    try {
      const { data, error } = await supabase
        .from('pain_logs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching pain log:', error)
      throw error
    }
  }

  static async updatePainLog(id: string, data: Partial<PainLogEntry>) {
    try {
      const { data: entry, error } = await supabase
        .from('pain_logs')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return entry
    } catch (error) {
      console.error('Error updating pain log:', error)
      throw error
    }
  }

  static async deletePainLog(id: string) {
    try {
      const { error } = await supabase
        .from('pain_logs')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting pain log:', error)
      throw error
    }
  }

  static async getWeeklyStats(userId: string) {
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6) // Last 7 days including today
      sevenDaysAgo.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('pain_logs')
        .select('pain_level, created_at')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by date (YYYY-MM-DD) instead of day name
      const stats: { [key: string]: number[] } = {}
      
      data.forEach((entry) => {
        // Get date in YYYY-MM-DD format
        const entryDate = new Date(entry.created_at)
        const dateKey = entryDate.toISOString().split('T')[0]
        
        if (!stats[dateKey]) stats[dateKey] = []
        stats[dateKey].push(entry.pain_level)
      })

      console.log('getWeeklyStats result:', stats)
      return stats
    } catch (error) {
      console.error('Error fetching weekly stats:', error)
      throw error
    }
  }
}
