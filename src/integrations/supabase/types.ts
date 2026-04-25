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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          added_by: string | null
          created_at: string
          email: string
          id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          active: boolean
          area: string
          created_at: string
          delivery_fee: number
          free_above: number | null
          id: string
          min_order_value: number
          postcodes: string[]
          updated_at: string
        }
        Insert: {
          active?: boolean
          area: string
          created_at?: string
          delivery_fee: number
          free_above?: number | null
          id?: string
          min_order_value: number
          postcodes: string[]
          updated_at?: string
        }
        Update: {
          active?: boolean
          area?: string
          created_at?: string
          delivery_fee?: number
          free_above?: number | null
          id?: string
          min_order_value?: number
          postcodes?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total: number
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          coupon_code: string | null
          created_at: string
          customer_company: string | null
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_phone: string
          delivery_date: string | null
          delivery_fee: number
          delivery_time: string | null
          delivery_zone_id: string | null
          discount: number
          id: string
          method: Database["public"]["Enums"]["delivery_method"]
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string
          postcode: string | null
          ship_address: string | null
          ship_city: string | null
          ship_company: string | null
          ship_first_name: string | null
          ship_last_name: string | null
          ship_postcode: string | null
          ship_to_different: boolean
          status: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_company?: string | null
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_phone: string
          delivery_date?: string | null
          delivery_fee?: number
          delivery_time?: string | null
          delivery_zone_id?: string | null
          discount?: number
          id?: string
          method?: Database["public"]["Enums"]["delivery_method"]
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string
          postcode?: string | null
          ship_address?: string | null
          ship_city?: string | null
          ship_company?: string | null
          ship_first_name?: string | null
          ship_last_name?: string | null
          ship_postcode?: string | null
          ship_to_different?: boolean
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal: number
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_company?: string | null
          customer_email?: string
          customer_first_name?: string
          customer_last_name?: string
          customer_phone?: string
          delivery_date?: string | null
          delivery_fee?: number
          delivery_time?: string | null
          delivery_zone_id?: string | null
          discount?: number
          id?: string
          method?: Database["public"]["Enums"]["delivery_method"]
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string
          postcode?: string | null
          ship_address?: string | null
          ship_city?: string | null
          ship_company?: string | null
          ship_first_name?: string | null
          ship_last_name?: string | null
          ship_postcode?: string | null
          ship_to_different?: boolean
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description_en: string | null
          description_nl: string | null
          display_order: number
          id: string
          image_url: string | null
          name_en: string
          name_nl: string
          price: number
          spice: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          description_en?: string | null
          description_nl?: string | null
          display_order?: number
          id: string
          image_url?: string | null
          name_en: string
          name_nl: string
          price: number
          spice?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description_en?: string | null
          description_nl?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          name_en?: string
          name_nl?: string
          price?: number
          spice?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          postcode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          postcode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          postcode?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          created_at: string
          id: string
          is_delivery_open: boolean
          is_pickup_open: boolean
          standard_lead_time_minutes: number
          temporary_message: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_delivery_open?: boolean
          is_pickup_open?: boolean
          standard_lead_time_minutes?: number
          temporary_message?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_delivery_open?: boolean
          is_pickup_open?: boolean
          standard_lead_time_minutes?: number
          temporary_message?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_email_admin: { Args: { _email: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "customer"
      delivery_method: "pickup" | "delivery"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "pending_payment"
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
      app_role: ["admin", "customer"],
      delivery_method: ["pickup", "delivery"],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "pending_payment",
      ],
    },
  },
} as const
