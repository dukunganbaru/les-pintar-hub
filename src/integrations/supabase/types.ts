export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          created_at: string
          duration_hours: number
          hourly_rate: number
          id: string
          notes: string | null
          parent_id: string
          status: Database["public"]["Enums"]["booking_status"]
          student_id: string
          student_notes: string | null
          subject: string
          total_amount: number
          tutor_id: string
          tutor_notes: string | null
          updated_at: string
        }
        Insert: {
          booking_date: string
          created_at?: string
          duration_hours?: number
          hourly_rate: number
          id?: string
          notes?: string | null
          parent_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_id: string
          student_notes?: string | null
          subject: string
          total_amount: number
          tutor_id: string
          tutor_notes?: string | null
          updated_at?: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          duration_hours?: number
          hourly_rate?: number
          id?: string
          notes?: string | null
          parent_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_id?: string
          student_notes?: string | null
          subject?: string
          total_amount?: number
          tutor_id?: string
          tutor_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          created_at: string
          duration_hours: number
          hourly_rate: number
          id: string
          lesson_date: string
          notes: string | null
          status: Database["public"]["Enums"]["lesson_status"]
          student_id: string
          student_notes: string | null
          subject: Database["public"]["Enums"]["subject_type"]
          teacher_id: string
          teacher_notes: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_hours?: number
          hourly_rate: number
          id?: string
          lesson_date: string
          notes?: string | null
          status?: Database["public"]["Enums"]["lesson_status"]
          student_id: string
          student_notes?: string | null
          subject: Database["public"]["Enums"]["subject_type"]
          teacher_id: string
          teacher_notes?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_hours?: number
          hourly_rate?: number
          id?: string
          lesson_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["lesson_status"]
          student_id?: string
          student_notes?: string | null
          subject?: Database["public"]["Enums"]["subject_type"]
          teacher_id?: string
          teacher_notes?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          address: string | null
          created_at: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          id: string
          parent_id: string
          payment_method: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          id?: string
          parent_id: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          id?: string
          parent_id?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          claimed_at: string | null
          created_at: string
          id: string
          is_claimed: boolean
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_amount: number | null
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          id?: string
          is_claimed?: boolean
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_amount?: number | null
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          id?: string
          is_claimed?: boolean
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          reward_amount?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          lesson_id: string
          parent_id: string | null
          rating: number
          review_text: string | null
          student_id: string
          teacher_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          parent_id?: string | null
          rating: number
          review_text?: string | null
          student_id: string
          teacher_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          parent_id?: string | null
          rating?: number
          review_text?: string | null
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          education_level: Database["public"]["Enums"]["education_level"]
          grade: string | null
          id: string
          parent_id: string | null
          parent_name: string | null
          parent_phone: string | null
          profile_id: string
          school_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          education_level: Database["public"]["Enums"]["education_level"]
          grade?: string | null
          id?: string
          parent_id?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          profile_id: string
          school_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          education_level?: Database["public"]["Enums"]["education_level"]
          grade?: string | null
          id?: string
          parent_id?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          profile_id?: string
          school_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          available_balance: number | null
          bio: string | null
          certifications: string[] | null
          created_at: string
          description: string | null
          education_background: string | null
          education_levels: Database["public"]["Enums"]["education_level"][]
          experience_years: number
          hourly_rate: number
          id: string
          is_available: boolean
          is_verified: boolean
          location: string | null
          profile_id: string
          rating: number | null
          subjects: Database["public"]["Enums"]["subject_type"][]
          teaching_method: string[] | null
          total_earnings: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          education_background?: string | null
          education_levels: Database["public"]["Enums"]["education_level"][]
          experience_years?: number
          hourly_rate: number
          id?: string
          is_available?: boolean
          is_verified?: boolean
          location?: string | null
          profile_id: string
          rating?: number | null
          subjects: Database["public"]["Enums"]["subject_type"][]
          teaching_method?: string[] | null
          total_earnings?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          education_background?: string | null
          education_levels?: Database["public"]["Enums"]["education_level"][]
          experience_years?: number
          hourly_rate?: number
          id?: string
          is_available?: boolean
          is_verified?: boolean
          location?: string | null
          profile_id?: string
          rating?: number | null
          subjects?: Database["public"]["Enums"]["subject_type"][]
          teaching_method?: string[] | null
          total_earnings?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          tutor_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
          tutor_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          tutor_id?: string
        }
        Relationships: []
      }
      withdraw_requests: {
        Row: {
          amount: number
          bank_account: string | null
          id: string
          processed_at: string | null
          requested_at: string
          status: Database["public"]["Enums"]["withdraw_status"]
          tutor_id: string
        }
        Insert: {
          amount: number
          bank_account?: string | null
          id?: string
          processed_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdraw_status"]
          tutor_id: string
        }
        Update: {
          amount?: number
          bank_account?: string | null
          id?: string
          processed_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdraw_status"]
          tutor_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_test_profile: {
        Args: {
          p_full_name: string
          p_role: Database["public"]["Enums"]["user_role"]
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "rejected"
      education_level: "sd" | "smp" | "sma" | "kuliah"
      lesson_status: "pending" | "confirmed" | "completed" | "cancelled"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      subject_type:
        | "matematika"
        | "fisika"
        | "kimia"
        | "biologi"
        | "bahasa_inggris"
        | "bahasa_indonesia"
        | "sejarah"
        | "geografi"
        | "ekonomi"
        | "akuntansi"
      user_role: "admin" | "teacher" | "student"
      withdraw_status: "pending" | "approved" | "rejected" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "rejected",
      ],
      education_level: ["sd", "smp", "sma", "kuliah"],
      lesson_status: ["pending", "confirmed", "completed", "cancelled"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      subject_type: [
        "matematika",
        "fisika",
        "kimia",
        "biologi",
        "bahasa_inggris",
        "bahasa_indonesia",
        "sejarah",
        "geografi",
        "ekonomi",
        "akuntansi",
      ],
      user_role: ["admin", "teacher", "student"],
      withdraw_status: ["pending", "approved", "rejected", "completed"],
    },
  },
} as const
