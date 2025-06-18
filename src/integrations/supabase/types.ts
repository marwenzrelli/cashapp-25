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
          email: string | null
          id: number
          nom: string
          prenom: string
          solde: number | null
          status: string | null
          telephone: string | null
        }
        Insert: {
          created_by?: string | null
          date_creation?: string | null
          email?: string | null
          id?: number
          nom: string
          prenom: string
          solde?: number | null
          status?: string | null
          telephone?: string | null
        }
        Update: {
          created_by?: string | null
          date_creation?: string | null
          email?: string | null
          id?: number
          nom?: string
          prenom?: string
          solde?: number | null
          status?: string | null
          telephone?: string | null
        }
        Relationships: []
      }
      deleted_deposits: {
        Row: {
          amount: number
          client_name: string
          deleted_at: string | null
          deleted_by: string | null
          id: number
          notes: string | null
          operation_date: string | null
          original_id: number
          status: string | null
        }
        Insert: {
          amount: number
          client_name: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          notes?: string | null
          operation_date?: string | null
          original_id: number
          status?: string | null
        }
        Update: {
          amount?: number
          client_name?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          notes?: string | null
          operation_date?: string | null
          original_id?: number
          status?: string | null
        }
        Relationships: []
      }
      deleted_direct_operations: {
        Row: {
          amount: number
          deleted_at: string | null
          deleted_by: string | null
          from_client_id: number | null
          from_client_name: string
          id: number
          notes: string | null
          operation_date: string | null
          original_id: number
          status: string | null
          to_client_id: number | null
          to_client_name: string
        }
        Insert: {
          amount: number
          deleted_at?: string | null
          deleted_by?: string | null
          from_client_id?: number | null
          from_client_name: string
          id?: number
          notes?: string | null
          operation_date?: string | null
          original_id: number
          status?: string | null
          to_client_id?: number | null
          to_client_name: string
        }
        Update: {
          amount?: number
          deleted_at?: string | null
          deleted_by?: string | null
          from_client_id?: number | null
          from_client_name?: string
          id?: number
          notes?: string | null
          operation_date?: string | null
          original_id?: number
          status?: string | null
          to_client_id?: number | null
          to_client_name?: string
        }
        Relationships: []
      }
      deleted_transfers: {
        Row: {
          amount: number
          deleted_at: string | null
          deleted_by: string | null
          from_client: string
          id: number
          operation_date: string | null
          original_id: number
          reason: string | null
          status: string | null
          to_client: string
        }
        Insert: {
          amount: number
          deleted_at?: string | null
          deleted_by?: string | null
          from_client: string
          id?: number
          operation_date?: string | null
          original_id: number
          reason?: string | null
          status?: string | null
          to_client: string
        }
        Update: {
          amount?: number
          deleted_at?: string | null
          deleted_by?: string | null
          from_client?: string
          id?: number
          operation_date?: string | null
          original_id?: number
          reason?: string | null
          status?: string | null
          to_client?: string
        }
        Relationships: []
      }
      deleted_withdrawals: {
        Row: {
          amount: number
          client_name: string
          deleted_at: string | null
          deleted_by: string | null
          id: number
          notes: string | null
          operation_date: string | null
          original_id: number
          status: string | null
        }
        Insert: {
          amount: number
          client_name: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          notes?: string | null
          operation_date?: string | null
          original_id: number
          status?: string | null
        }
        Update: {
          amount?: number
          client_name?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          notes?: string | null
          operation_date?: string | null
          original_id?: number
          status?: string | null
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          client_id: number | null
          client_name: string
          created_at: string | null
          created_by: string | null
          id: number
          last_modified_at: string | null
          notes: string | null
          operation_date: string | null
          status: string | null
        }
        Insert: {
          amount: number
          client_id?: number | null
          client_name: string
          created_at?: string | null
          created_by?: string | null
          id?: number
          last_modified_at?: string | null
          notes?: string | null
          operation_date?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          client_id?: number | null
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          id?: number
          last_modified_at?: string | null
          notes?: string | null
          operation_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_operations: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          from_client_id: number | null
          from_client_name: string
          id: number
          notes: string | null
          operation_date: string | null
          operation_type: string | null
          status: string | null
          to_client_id: number | null
          to_client_name: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          from_client_id?: number | null
          from_client_name: string
          id?: number
          notes?: string | null
          operation_date?: string | null
          operation_type?: string | null
          status?: string | null
          to_client_id?: number | null
          to_client_name: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          from_client_id?: number | null
          from_client_name?: string
          id?: number
          notes?: string | null
          operation_date?: string | null
          operation_type?: string | null
          status?: string | null
          to_client_id?: number | null
          to_client_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_operations_from_client_id_fkey"
            columns: ["from_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_operations_to_client_id_fkey"
            columns: ["to_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          last_login: string | null
          phone: string | null
          profile_role: string | null
          role: string | null
          status: string | null
          username: string | null
        }
        Insert: {
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_login?: string | null
          phone?: string | null
          profile_role?: string | null
          role?: string | null
          status?: string | null
          username?: string | null
        }
        Update: {
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          phone?: string | null
          profile_role?: string | null
          role?: string | null
          status?: string | null
          username?: string | null
        }
        Relationships: []
      }
      qr_access: {
        Row: {
          access_token: string
          client_id: number | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: number
        }
        Insert: {
          access_token: string
          client_id?: number | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: number
        }
        Update: {
          access_token?: string
          client_id?: number | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "qr_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          from_client: string
          id: number
          last_modified_at: string | null
          operation_date: string | null
          reason: string | null
          status: string | null
          to_client: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          from_client: string
          id?: number
          last_modified_at?: string | null
          operation_date?: string | null
          reason?: string | null
          status?: string | null
          to_client: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          from_client?: string
          id?: number
          last_modified_at?: string | null
          operation_date?: string | null
          reason?: string | null
          status?: string | null
          to_client?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          client_id: number | null
          client_name: string
          created_at: string | null
          created_by: string | null
          id: number
          last_modified_at: string | null
          notes: string | null
          operation_date: string | null
          status: string | null
        }
        Insert: {
          amount: number
          client_id?: number | null
          client_name: string
          created_at?: string | null
          created_by?: string | null
          id?: number
          last_modified_at?: string | null
          notes?: string | null
          operation_date?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          client_id?: number | null
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          id?: number
          last_modified_at?: string | null
          notes?: string | null
          operation_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      operation_statistics: {
        Row: {
          deposit_count: number | null
          deposit_total: number | null
          transfer_count: number | null
          transfer_total: number | null
          withdrawal_count: number | null
          withdrawal_total: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_valid_public_client_access: {
        Args: { client_id: number; token: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
