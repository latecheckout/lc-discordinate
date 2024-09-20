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
            foreignKeyName: 'Button press_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'button_press_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'session'
            referencedColumns: ['id']
          },
        ]
      }
      community: {
        Row: {
          created_at: string | null
          guild_id: string
          id: string
          name: string
          pfp: string | null
        }
        Insert: {
          created_at?: string | null
          guild_id: string
          id?: string
          name: string
          pfp?: string | null
        }
        Update: {
          created_at?: string | null
          guild_id?: string
          id?: string
          name?: string
          pfp?: string | null
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          all_time_high_score: number
          community_id: string
          rank: number
          updated_at: string
        }
        Insert: {
          all_time_high_score: number
          community_id: string
          rank: number
          updated_at?: string
        }
        Update: {
          all_time_high_score?: number
          community_id?: string
          rank?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'leaderboard_community_id_fkey'
            columns: ['community_id']
            isOneToOne: true
            referencedRelation: 'community'
            referencedColumns: ['id']
          },
        ]
      }
      session: {
        Row: {
          community_id: string
          config_id: string
          created_at: string
          created_by: string
          current_score: number
          final_score: number
          id: string
          scheduled_at: string
        }
        Insert: {
          community_id: string
          config_id?: string
          created_at?: string
          created_by?: string
          current_score?: number
          final_score?: number
          id?: string
          scheduled_at: string
        }
        Update: {
          community_id?: string
          config_id?: string
          created_at?: string
          created_by?: string
          current_score?: number
          final_score?: number
          id?: string
          scheduled_at?: string
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
            foreignKeyName: 'session_config_id_fkey'
            columns: ['config_id']
            isOneToOne: false
            referencedRelation: 'session_config'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'session_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      session_config: {
        Row: {
          button_press_seconds: number
          button_press_timeout_seconds: number
          countdown_seconds: number
          created_at: string
          id: string
          is_default: boolean
          score_window_seconds: number
        }
        Insert: {
          button_press_seconds?: number
          button_press_timeout_seconds?: number
          countdown_seconds?: number
          created_at?: string
          id?: string
          is_default?: boolean
          score_window_seconds?: number
        }
        Update: {
          button_press_seconds?: number
          button_press_timeout_seconds?: number
          countdown_seconds?: number
          created_at?: string
          id?: string
          is_default?: boolean
          score_window_seconds?: number
        }
        Relationships: []
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
      user_to_session: {
        Row: {
          community_id: string
          created_at: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_to_session_community_id_fkey'
            columns: ['community_id']
            isOneToOne: false
            referencedRelation: 'community'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_to_session_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'session'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_to_session_user_id_fkey'
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
      calculate_session_score: {
        Args: {
          p_session_id: string
          p_timestamp: string
        }
        Returns: undefined
      }
      check_session_score: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_default_session_config_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
