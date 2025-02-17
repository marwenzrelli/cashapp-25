export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          created_by: string | null
          date_creation: string | null
          email: string
          id: number
          nom: string
          prenom: string
          solde: number
          status: string
          telephone: string
        }
        Insert: {
          created_by?: string | null
          date_creation?: string | null
          email: string
          id?: number
          nom: string
          prenom: string
          solde?: number
          status?: string
          telephone: string
        }
        Update: {
          created_by?: string | null
          date_creation?: string | null
          email?: string
          id?: number
          nom?: string
          prenom?: string
          solde?: number
          status?: string
          telephone?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          client_name: string
          created_at: string
          created_by: string | null
          id: number
          notes: string | null
          operation_date: string
          status: string
        }
        Insert: {
          amount: number
          client_name: string
          created_at?: string
          created_by?: string | null
          id?: number
          notes?: string | null
          operation_date?: string
          status?: string
        }
        Update: {
          amount?: number
          client_name?: string
          created_at?: string
          created_by?: string | null
          id?: number
          notes?: string | null
          operation_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          currency: string
          department: string
          email: string
          full_name: string
          id: string
          last_login: string | null
          phone: string | null
          role: string
          status: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          currency?: string
          department: string
          email: string
          full_name: string
          id: string
          last_login?: string | null
          phone?: string | null
          role: string
          status?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          currency?: string
          department?: string
          email?: string
          full_name?: string
          id?: string
          last_login?: string | null
          phone?: string | null
          role?: string
          status?: string
        }
        Relationships: []
      }
      transfers: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          from_client: string
          id: string
          operation_date: string
          reason: string
          status: string
          to_client: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          from_client: string
          id?: string
          operation_date?: string
          reason: string
          status?: string
          to_client: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          from_client?: string
          id?: string
          operation_date?: string
          reason?: string
          status?: string
          to_client?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          id: string
          module: string
          permission_description: string | null
          permission_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          module: string
          permission_description?: string | null
          permission_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          module?: string
          permission_description?: string | null
          permission_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number
          client_name: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          operation_date: string
          status: string
        }
        Insert: {
          amount: number
          client_name: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          operation_date?: string
          status?: string
        }
        Update: {
          amount?: number
          client_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          operation_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      operation_statistics: {
        Row: {
          day: string | null
          deposit_count: number | null
          total_deposits: number | null
          total_transfers: number | null
          total_withdrawals: number | null
          transfer_count: number | null
          withdrawal_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
