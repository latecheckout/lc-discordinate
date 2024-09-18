export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      button_press: {
        Row: {
          created_at: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'Button press_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'session'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'Button press_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      community: {
        Row: {
          created_at: string | null
          created_by: string
          guild_id: string
          id: string
          name: string
          pfp: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          guild_id: string
          id?: string
          name: string
          pfp?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          guild_id?: string
          id?: string
          name?: string
          pfp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'community_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      session: {
        Row: {
          community_id: string | null
          created_at: string | null
          created_by: string
          current_score: number | null
          final_score: number | null
          id: string
          scheduled_at: string
          started_by: string | null
        }
        Insert: {
          community_id?: string | null
          created_at?: string | null
          created_by: string
          current_score?: number | null
          final_score?: number | null
          id?: string
          scheduled_at: string
          started_by?: string | null
        }
        Update: {
          community_id?: string | null
          created_at?: string | null
          created_by?: string
          current_score?: number | null
          final_score?: number | null
          id?: string
          scheduled_at?: string
          started_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'session_community_id_fkey'
            columns: ['community_id']
            isOneToOne: false
            referencedRelation: 'community'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'session_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'session_started_by_fkey'
            columns: ['started_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      user_to_community: {
        Row: {
          community_id: string
          created_at: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_to_community_community_id_fkey'
            columns: ['community_id']
            isOneToOne: false
            referencedRelation: 'community'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_to_community_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      join_session_queue: {
        Args: {
          p_community_id: string
        }
        Returns: string
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

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never
