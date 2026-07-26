export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          profile_id: string
          role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          profile_id: string
          role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          profile_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string
          currency: string
          id: string
          name: string
          profile_id: string
          type: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          name: string
          profile_id: string
          type?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          name?: string
          profile_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      body_metrics: {
        Row: {
          body_battery: number | null
          body_fat_pct: number | null
          created_at: string
          date: string
          energy: number | null
          hrv: number | null
          hunger: number | null
          id: string
          notes: string | null
          profile_id: string
          resting_hr: number | null
          sleep_hours: number | null
          source: Database["public"]["Enums"]["data_source"]
          supplements: string | null
          water_l: number | null
          weight_kg: number | null
        }
        Insert: {
          body_battery?: number | null
          body_fat_pct?: number | null
          created_at?: string
          date: string
          energy?: number | null
          hrv?: number | null
          hunger?: number | null
          id?: string
          notes?: string | null
          profile_id: string
          resting_hr?: number | null
          sleep_hours?: number | null
          source?: Database["public"]["Enums"]["data_source"]
          supplements?: string | null
          water_l?: number | null
          weight_kg?: number | null
        }
        Update: {
          body_battery?: number | null
          body_fat_pct?: number | null
          created_at?: string
          date?: string
          energy?: number | null
          hrv?: number | null
          hunger?: number | null
          id?: string
          notes?: string | null
          profile_id?: string
          resting_hr?: number | null
          sleep_hours?: number | null
          source?: Database["public"]["Enums"]["data_source"]
          supplements?: string | null
          water_l?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_metrics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          category: string
          created_at: string
          id: string
          month: string
          planned_amount: number
          profile_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          month: string
          planned_amount?: number
          profile_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          month?: string
          planned_amount?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          habit_id: string
          id: string
          profile_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          habit_id: string
          id?: string
          profile_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          profile_id: string
          target_frequency: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          profile_id: string
          target_frequency?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          profile_id?: string
          target_frequency?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          created_at: string
          id: string
          priority: string
          profile_id: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          priority?: string
          profile_id: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          priority?: string
          profile_id?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          calories: number | null
          carbs_g: number | null
          created_at: string
          date: string
          fat_g: number | null
          fiber_g: number | null
          id: string
          micronutrients: Json | null
          name: string
          notes: string | null
          profile_id: string
          protein_g: number | null
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          date: string
          fat_g?: number | null
          fiber_g?: number | null
          id?: string
          micronutrients?: Json | null
          name: string
          notes?: string | null
          profile_id: string
          protein_g?: number | null
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          date?: string
          fat_g?: number | null
          fiber_g?: number | null
          id?: string
          micronutrients?: Json | null
          name?: string
          notes?: string | null
          profile_id?: string
          protein_g?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_targets: {
        Row: {
          calories_target: number | null
          carbs_g_target: number | null
          created_at: string
          effective_from: string
          fat_g_target: number | null
          id: string
          notes: string | null
          profile_id: string
          protein_g_target: number | null
        }
        Insert: {
          calories_target?: number | null
          carbs_g_target?: number | null
          created_at?: string
          effective_from: string
          fat_g_target?: number | null
          id?: string
          notes?: string | null
          profile_id: string
          protein_g_target?: number | null
        }
        Update: {
          calories_target?: number | null
          carbs_g_target?: number | null
          created_at?: string
          effective_from?: string
          fat_g_target?: number | null
          id?: string
          notes?: string | null
          profile_id?: string
          protein_g_target?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_targets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      objectives: {
        Row: {
          created_at: string
          description: string | null
          id: string
          period_end: string
          period_start: string
          period_type: string
          profile_id: string
          progress_pct: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          period_end: string
          period_start: string
          period_type?: string
          profile_id: string
          progress_pct?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          period_end?: string
          period_start?: string
          period_type?: string
          profile_id?: string
          progress_pct?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "objectives_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          timezone: string
          units: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          timezone?: string
          units?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          timezone?: string
          units?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          name: string
          priority: string
          profile_id: string
          progress_pct: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          priority?: string
          profile_id: string
          progress_pct?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          priority?: string
          profile_id?: string
          progress_pct?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      races: {
        Row: {
          created_at: string
          date: string
          distance_type: string | null
          goal_time: string | null
          id: string
          name: string
          notes: string | null
          priority: Database["public"]["Enums"]["race_priority"]
          profile_id: string
          result: Json | null
          status: Database["public"]["Enums"]["race_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          distance_type?: string | null
          goal_time?: string | null
          id?: string
          name: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["race_priority"]
          profile_id: string
          result?: Json | null
          status?: Database["public"]["Enums"]["race_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          distance_type?: string | null
          goal_time?: string | null
          id?: string
          name?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["race_priority"]
          profile_id?: string
          result?: Json | null
          status?: Database["public"]["Enums"]["race_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "races_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          active: boolean
          amount: number
          billing_cycle: string
          created_at: string
          currency: string
          id: string
          name: string
          next_charge_date: string | null
          profile_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          billing_cycle?: string
          created_at?: string
          currency?: string
          id?: string
          name: string
          next_charge_date?: string | null
          profile_id: string
        }
        Update: {
          active?: boolean
          amount?: number
          billing_cycle?: string
          created_at?: string
          currency?: string
          id?: string
          name?: string
          next_charge_date?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          priority: string
          profile_id: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: string
          profile_id: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: string
          profile_id?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          category: string | null
          created_at: string
          currency: string
          date: string
          description: string | null
          id: string
          profile_id: string
          type: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category?: string | null
          created_at?: string
          currency?: string
          date: string
          description?: string | null
          id?: string
          profile_id: string
          type?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string | null
          created_at?: string
          currency?: string
          date?: string
          description?: string | null
          id?: string
          profile_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          avg_hr: number | null
          avg_pace_sec_per_100m: number | null
          avg_pace_sec_per_km: number | null
          avg_power_watts: number | null
          cadence: number | null
          created_at: string
          date: string
          description: string | null
          discipline: Database["public"]["Enums"]["discipline"]
          distance_km: number | null
          duration_min: number | null
          elevation_gain_m: number | null
          external_id: string | null
          id: string
          intensity_factor: number | null
          kind: Database["public"]["Enums"]["workout_kind"]
          planned_distance_km: number | null
          planned_duration_min: number | null
          profile_id: string
          source: Database["public"]["Enums"]["data_source"]
          title: string
          tss: number | null
          updated_at: string
          zone_label: string | null
        }
        Insert: {
          avg_hr?: number | null
          avg_pace_sec_per_100m?: number | null
          avg_pace_sec_per_km?: number | null
          avg_power_watts?: number | null
          cadence?: number | null
          created_at?: string
          date: string
          description?: string | null
          discipline: Database["public"]["Enums"]["discipline"]
          distance_km?: number | null
          duration_min?: number | null
          elevation_gain_m?: number | null
          external_id?: string | null
          id?: string
          intensity_factor?: number | null
          kind?: Database["public"]["Enums"]["workout_kind"]
          planned_distance_km?: number | null
          planned_duration_min?: number | null
          profile_id: string
          source?: Database["public"]["Enums"]["data_source"]
          title: string
          tss?: number | null
          updated_at?: string
          zone_label?: string | null
        }
        Update: {
          avg_hr?: number | null
          avg_pace_sec_per_100m?: number | null
          avg_pace_sec_per_km?: number | null
          avg_power_watts?: number | null
          cadence?: number | null
          created_at?: string
          date?: string
          description?: string | null
          discipline?: Database["public"]["Enums"]["discipline"]
          distance_km?: number | null
          duration_min?: number | null
          elevation_gain_m?: number | null
          external_id?: string | null
          id?: string
          intensity_factor?: number | null
          kind?: Database["public"]["Enums"]["workout_kind"]
          planned_distance_km?: number | null
          planned_duration_min?: number | null
          profile_id?: string
          source?: Database["public"]["Enums"]["data_source"]
          title?: string
          tss?: number | null
          updated_at?: string
          zone_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      zone_sets: {
        Row: {
          bike_ftp_watts: number | null
          created_at: string
          effective_from: string
          id: string
          notes: string | null
          profile_id: string
          run_threshold_sec_per_km: number | null
          swim_css_sec_per_100m: number | null
        }
        Insert: {
          bike_ftp_watts?: number | null
          created_at?: string
          effective_from: string
          id?: string
          notes?: string | null
          profile_id: string
          run_threshold_sec_per_km?: number | null
          swim_css_sec_per_100m?: number | null
        }
        Update: {
          bike_ftp_watts?: number | null
          created_at?: string
          effective_from?: string
          id?: string
          notes?: string | null
          profile_id?: string
          run_threshold_sec_per_km?: number | null
          swim_css_sec_per_100m?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "zone_sets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      data_source: "manual" | "garmin" | "strava" | "trainingpeaks"
      discipline: "run" | "bike" | "swim" | "strength" | "other"
      race_priority: "A" | "B" | "C"
      race_status: "upcoming" | "completed" | "dns" | "dnf"
      workout_kind: "planned" | "actual"
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
      data_source: ["manual", "garmin", "strava", "trainingpeaks"],
      discipline: ["run", "bike", "swim", "strength", "other"],
      race_priority: ["A", "B", "C"],
      race_status: ["upcoming", "completed", "dns", "dnf"],
      workout_kind: ["planned", "actual"],
    },
  },
} as const
