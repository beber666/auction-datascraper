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
      alert_preferences: {
        Row: {
          alert_minutes: number
          enable_browser: boolean
          enable_email: boolean
          enable_telegram: boolean
          telegram_chat_id: string | null
          telegram_token: string | null
          user_id: string
        }
        Insert: {
          alert_minutes?: number
          enable_browser?: boolean
          enable_email?: boolean
          enable_telegram?: boolean
          telegram_chat_id?: string | null
          telegram_token?: string | null
          user_id: string
        }
        Update: {
          alert_minutes?: number
          enable_browser?: boolean
          enable_email?: boolean
          enable_telegram?: boolean
          telegram_chat_id?: string | null
          telegram_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auction_alerts: {
        Row: {
          auction_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          auction_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          auction_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_alerts_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auctions: {
        Row: {
          created_at: string
          current_price: string | null
          end_time: string | null
          id: string
          image_url: string | null
          last_updated: string | null
          number_of_bids: string | null
          price_in_jpy: number | null
          product_name: string | null
          time_remaining: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_price?: string | null
          end_time?: string | null
          id?: string
          image_url?: string | null
          last_updated?: string | null
          number_of_bids?: string | null
          price_in_jpy?: number | null
          product_name?: string | null
          time_remaining?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_price?: string | null
          end_time?: string | null
          id?: string
          image_url?: string | null
          last_updated?: string | null
          number_of_bids?: string | null
          price_in_jpy?: number | null
          product_name?: string | null
          time_remaining?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      package_items: {
        Row: {
          created_at: string
          id: string
          link: string | null
          local_shipping_price: number | null
          name: string
          package_id: string
          purchase_price: number | null
          updated_at: string
          user_id: string
          weight_kg: number | null
          zen_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          local_shipping_price?: number | null
          name: string
          package_id: string
          purchase_price?: number | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
          zen_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          local_shipping_price?: number | null
          name?: string
          package_id?: string
          purchase_price?: number | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
          zen_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          customs_fees: number
          customs_percentage: number | null
          id: string
          international_shipping: number | null
          margin: number | null
          name: string
          notes: string | null
          other_costs: number
          selling_price: number | null
          shipping_cost: number
          total_items_cost: number | null
          total_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customs_fees?: number
          customs_percentage?: number | null
          id?: string
          international_shipping?: number | null
          margin?: number | null
          name: string
          notes?: string | null
          other_costs?: number
          selling_price?: number | null
          shipping_cost?: number
          total_items_cost?: number | null
          total_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customs_fees?: number
          customs_percentage?: number | null
          id?: string
          international_shipping?: number | null
          margin?: number | null
          name?: string
          notes?: string | null
          other_costs?: number
          selling_price?: number | null
          shipping_cost?: number
          total_items_cost?: number | null
          total_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auto_refresh: boolean | null
          country: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          preferred_currency: string | null
          preferred_language: string | null
          refresh_interval: number | null
        }
        Insert: {
          auto_refresh?: boolean | null
          country?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          preferred_currency?: string | null
          preferred_language?: string | null
          refresh_interval?: number | null
        }
        Update: {
          auto_refresh?: boolean | null
          country?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferred_currency?: string | null
          preferred_language?: string | null
          refresh_interval?: number | null
        }
        Relationships: []
      }
      sent_notifications: {
        Row: {
          alert_minutes: number
          auction_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          alert_minutes: number
          auction_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          alert_minutes?: number
          auction_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sent_notifications_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
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
