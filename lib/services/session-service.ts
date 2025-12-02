import { createClient } from '@/lib/supabase/client'

export interface Question {
  id: string
  question_text: string
  question_order: number
  session_id: string
}

export interface Answer {
  id: string
  answer_text: string
  user_id: string
  question_id: string
  session_id: string
}

export interface Session {
  id: string
  name: string | null
}

export interface Submission {
  id: string
  session_id: string
  user_id: string
}

class SessionService {
  private supabase: ReturnType<typeof createClient>

  constructor() {
    this.supabase = createClient()
  }

  async loadSession(sessionId: string): Promise<Session | null> {
    try {
      const { data, error } = await this.supabase
        .from('sessions')
        .select('id, name')
        .eq('id', sessionId)
        .single()

      if (error) {
        if (
          error.code === 'PGRST116' ||
          error.message?.includes('permission') ||
          error.message?.includes('row-level security')
        ) {
          console.error('Access denied or session not found:', error.message)
          return null
        }
        throw error
      }
      return data
    } catch (error) {
      console.error('Error loading session data:', error)
      return null
    }
  }

  async loadQuestions(sessionId: string): Promise<Question[]> {
    try {
      const { data, error } = await this.supabase
        .from('questions')
        .select('*')
        .eq('session_id', sessionId)
        .order('question_order', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error loading questions:', error)
      throw error
    }
  }

  async loadAllAnswers(sessionId: string): Promise<Record<string, Answer[]>> {
    try {
      const { data, error } = await this.supabase
        .from('answers')
        .select('*')
        .eq('session_id', sessionId)

      if (error) throw error

      // Group answers by question_id
      const grouped: Record<string, Answer[]> = {}
      data?.forEach((answer) => {
        if (!grouped[answer.question_id]) {
          grouped[answer.question_id] = []
        }
        grouped[answer.question_id].push(answer)
      })

      return grouped
    } catch (error) {
      console.error('Error loading answers:', error)
      throw error
    }
  }

  async checkSubmissionStatus(
    sessionId: string,
    userId: string
  ): Promise<Submission | null> {
    try {
      const { data } = await this.supabase
        .from('submissions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single()

      return data || null
    } catch (error) {
      // User hasn't submitted yet
      return null
    }
  }

  async submitAnswers(
    sessionId: string,
    userId: string,
    answers: Array<{ question_id: string; answer_text: string }>
  ): Promise<void> {
    try {
      // Insert all answers
      const answerEntries = answers.map((answer) => ({
        question_id: answer.question_id,
        session_id: sessionId,
        answer_text: answer.answer_text,
        user_id: userId,
      }))

      const { error: answersError } = await this.supabase
        .from('answers')
        .upsert(answerEntries, { onConflict: 'question_id,user_id' })

      if (answersError) throw answersError

      // Mark as submitted
      const { error: submissionError } = await this.supabase
        .from('submissions')
        .insert({
          session_id: sessionId,
          user_id: userId,
        })

      if (submissionError) throw submissionError
    } catch (error) {
      console.error('Error submitting answers:', error)
      throw error
    }
  }

  async addQuestion(
    sessionId: string,
    questionText: string,
    questionOrder: number
  ): Promise<Question> {
    try {
      const { data, error } = await this.supabase
        .from('questions')
        .insert({
          session_id: sessionId,
          question_text: questionText.trim(),
          question_order: questionOrder,
        })
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No data returned from insert')

      return data
    } catch (error) {
      console.error('Error adding question:', error)
      throw error
    }
  }

  subscribeToAnswers(
    sessionId: string,
    callback: () => void
  ): () => void {
    const channel = this.supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'answers' },
        () => {
          callback()
        }
      )
      .subscribe()

    return () => {
      this.supabase.removeChannel(channel)
    }
  }
}

// Export a singleton instance
export const sessionService = new SessionService()
