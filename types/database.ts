export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      clubs: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      brand_settings: {
        Row: {
          id: string;
          club_id: string;
          primary_color: string;
          accent_color: string;
          logo_path: string | null;
          font_family: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          primary_color: string;
          accent_color: string;
          logo_path?: string | null;
          font_family?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          primary_color?: string;
          accent_color?: string;
          logo_path?: string | null;
          font_family?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "brand_settings_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: true;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          }
        ];
      };
      teams: {
        Row: {
          id: string;
          club_id: string;
          name: string;
          stream: Database["public"]["Enums"]["stream_type"];
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          name: string;
          stream: Database["public"]["Enums"]["stream_type"];
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          name?: string;
          stream?: Database["public"]["Enums"]["stream_type"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "teams_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          }
        ];
      };
      fixtures: {
        Row: {
          id: string;
          club_id: string;
          team_id: string;
          opponent_name: string;
          round_label: string;
          fixture_date: string;
          venue: string;
          status: "scheduled" | "completed";
          home_score: number | null;
          away_score: number | null;
          result_outcome: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          team_id: string;
          opponent_name: string;
          round_label: string;
          fixture_date: string;
          venue: string;
          status?: "scheduled" | "completed";
          home_score?: number | null;
          away_score?: number | null;
          result_outcome?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          team_id?: string;
          opponent_name?: string;
          round_label?: string;
          fixture_date?: string;
          venue?: string;
          status?: "scheduled" | "completed";
          home_score?: number | null;
          away_score?: number | null;
          result_outcome?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fixtures_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fixtures_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      social_templates: {
        Row: {
          id: string;
          club_id: string;
          name: string;
          post_type: Database["public"]["Enums"]["social_post_type"];
          component_key: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          name: string;
          post_type: Database["public"]["Enums"]["social_post_type"];
          component_key: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          name?: string;
          post_type?: Database["public"]["Enums"]["social_post_type"];
          component_key?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "social_templates_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          }
        ];
      };
      media_assets: {
        Row: {
          id: string;
          club_id: string;
          storage_bucket: string;
          file_path: string;
          media_type: string;
          alt_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          storage_bucket: string;
          file_path: string;
          media_type: string;
          alt_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          storage_bucket?: string;
          file_path?: string;
          media_type?: string;
          alt_text?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_assets_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          }
        ];
      };
      social_posts: {
        Row: {
          id: string;
          club_id: string;
          fixture_id: string;
          template_id: string;
          post_type: Database["public"]["Enums"]["social_post_type"];
          caption: string;
          image_path: string | null;
          status: Database["public"]["Enums"]["social_post_status"];
          generated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          fixture_id: string;
          template_id: string;
          post_type: Database["public"]["Enums"]["social_post_type"];
          caption: string;
          image_path?: string | null;
          status?: Database["public"]["Enums"]["social_post_status"];
          generated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          fixture_id?: string;
          template_id?: string;
          post_type?: Database["public"]["Enums"]["social_post_type"];
          caption?: string;
          image_path?: string | null;
          status?: Database["public"]["Enums"]["social_post_status"];
          generated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "social_posts_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "social_posts_fixture_id_fkey";
            columns: ["fixture_id"];
            isOneToOne: false;
            referencedRelation: "fixtures";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "social_posts_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "social_templates";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      stream_type: "mens" | "womens" | "juniors";
      social_post_type: "preview_single" | "result_single" | "preview_summary" | "result_summary";
      social_post_status: "draft" | "posted";
    };
    CompositeTypes: Record<string, never>;
  };
};
