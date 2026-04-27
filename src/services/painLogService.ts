import { supabase } from './supabaseClient'

export interface PainLogEntry {
  id?: string
  user_id: string
  pain_level: number
  description: string
  tags: string[]
  created_at?: string
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

export class PainLogService {
  static async savePainLog(userId: string, data: Omit<PainLogEntry, 'id' | 'user_id' | 'created_at'>) {
    try {
      // Get today's date in LOCAL time (YYYY-MM-DD)
      const today = new Date()
      const dateKey = getLocalDateString(today)
      
      // Create start and end of today for querying
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
      const tomorrowStart = new Date(todayStart)
      tomorrowStart.setDate(tomorrowStart.getDate() + 1)

      // Check if there's already an entry for today
      const { data: existingEntries, error: fetchError } = await supabase
        .from('pain_logs')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', tomorrowStart.toISOString())

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
          .from('pain_logs')
          .insert([
            {
              user_id: userId,
              pain_level: data.pain_level,
              description: data.description,
              tags: data.tags,
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
      // Get today's date in LOCAL time (YYYY-MM-DD)
      const today = new Date()
      const todayLocal = getLocalDateString(today)
      
      // Calculate 6 days ago in local time
      const sevenDaysAgoLocal = new Date(today)
      sevenDaysAgoLocal.setDate(sevenDaysAgoLocal.getDate() - 6)
      
      // Create start time for 7 days ago (00:00 local time)
      const startDate = new Date(sevenDaysAgoLocal.getFullYear(), sevenDaysAgoLocal.getMonth(), sevenDaysAgoLocal.getDate(), 0, 0, 0, 0)
      // Create end time for today (23:59:59 local time, but we'll add 1 day)
      const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0, 0)

      const { data, error } = await supabase
        .from('pain_logs')
        .select('pain_level, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by date (YYYY-MM-DD) using LOCAL time
      const stats: { [key: string]: number[] } = {}
      
      data.forEach((entry) => {
        // Parse the timestamp and extract date in LOCAL time
        const entryDate = new Date(entry.created_at)
        const dateKey = getLocalDateString(entryDate)
        
        if (!stats[dateKey]) stats[dateKey] = []
        stats[dateKey].push(entry.pain_level)
      })

      return stats
    } catch (error) {
      console.error('Error fetching weekly stats:', error)
      throw error
    }
  }
}
