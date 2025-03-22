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
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          id?: number
          last_modified_at?: string | null
          notes?: string | null
          operation_date?: string | null
          status?: string | null
        }
        Relationships: []
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
        Args: {
          client_id: number
          token: string
        }
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
