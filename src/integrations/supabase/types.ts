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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_category: string | null
          event_label: string | null
          event_type: string
          event_value: string | null
          id: string
          metadata: Json | null
          page_path: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_category?: string | null
          event_label?: string | null
          event_type: string
          event_value?: string | null
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_category?: string | null
          event_label?: string | null
          event_type?: string
          event_value?: string | null
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          employer_notes: string | null
          id: string
          job_id: string
          profile_id: string
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          employer_notes?: string | null
          id?: string
          job_id: string
          profile_id: string
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          employer_notes?: string | null
          id?: string
          job_id?: string
          profile_id?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string
          category: string | null
          content: string
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          is_published: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          category?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      candidate_certificates: {
        Row: {
          created_at: string | null
          id: string
          issuer: string | null
          name: string
          profile_id: string
          url: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          issuer?: string | null
          name: string
          profile_id: string
          url?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          issuer?: string | null
          name?: string
          profile_id?: string
          url?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_certificates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_education: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          degree: string | null
          end_year: number | null
          field_of_study: string | null
          id: string
          institution: string
          is_current: boolean | null
          profile_id: string
          start_year: number | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          degree?: string | null
          end_year?: number | null
          field_of_study?: string | null
          id?: string
          institution: string
          is_current?: boolean | null
          profile_id: string
          start_year?: number | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          degree?: string | null
          end_year?: number | null
          field_of_study?: string | null
          id?: string
          institution?: string
          is_current?: boolean | null
          profile_id?: string
          start_year?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_portfolio: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          profile_id: string
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
          url: string
          visibility: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          profile_id: string
          tags?: string[] | null
          title: string
          type?: string
          updated_at?: string | null
          url: string
          visibility?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          profile_id?: string
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          url?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_portfolio_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_access: {
        Row: {
          created_at: string
          free_views_per_week: number
          free_views_remaining: number
          id: string
          is_subscribed: boolean
          trial_expires_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          free_views_per_week?: number
          free_views_remaining?: number
          id?: string
          is_subscribed?: boolean
          trial_expires_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          free_views_per_week?: number
          free_views_remaining?: number
          id?: string
          is_subscribed?: boolean
          trial_expires_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          founded_year: number | null
          id: string
          league: string | null
          logo_url: string | null
          name: string
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          league?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          league?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      custom_roles: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          normalized_role_id: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          normalized_role_id?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          normalized_role_id?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_roles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "role_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_roles_normalized_role_id_fkey"
            columns: ["normalized_role_id"]
            isOneToOne: false
            referencedRelation: "specialist_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          achievements: Json | null
          company_name: string
          created_at: string | null
          description: string | null
          employment_type: string | null
          end_date: string | null
          hide_org: boolean | null
          id: string
          is_current: boolean | null
          is_remote: boolean | null
          league: string | null
          position: string
          profile_id: string
          sport_ids: string[] | null
          start_date: string
          team_level: string | null
          tools: Json | null
          updated_at: string | null
        }
        Insert: {
          achievements?: Json | null
          company_name: string
          created_at?: string | null
          description?: string | null
          employment_type?: string | null
          end_date?: string | null
          hide_org?: boolean | null
          id?: string
          is_current?: boolean | null
          is_remote?: boolean | null
          league?: string | null
          position: string
          profile_id: string
          sport_ids?: string[] | null
          start_date: string
          team_level?: string | null
          tools?: Json | null
          updated_at?: string | null
        }
        Update: {
          achievements?: Json | null
          company_name?: string
          created_at?: string | null
          description?: string | null
          employment_type?: string | null
          end_date?: string | null
          hide_org?: boolean | null
          id?: string
          is_current?: boolean | null
          is_remote?: boolean | null
          league?: string | null
          position?: string
          profile_id?: string
          sport_ids?: string[] | null
          start_date?: string
          team_level?: string | null
          tools?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      hh_sources: {
        Row: {
          company_id: string | null
          created_at: string
          employer_id: string | null
          filters_json: Json | null
          id: string
          import_interval_minutes: number
          is_enabled: boolean
          moderation_mode: string
          name: string
          role_id: string | null
          search_query: string | null
          type: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          employer_id?: string | null
          filters_json?: Json | null
          id?: string
          import_interval_minutes?: number
          is_enabled?: boolean
          moderation_mode?: string
          name: string
          role_id?: string | null
          search_query?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          employer_id?: string | null
          filters_json?: Json | null
          id?: string
          import_interval_minutes?: number
          is_enabled?: boolean
          moderation_mode?: string
          name?: string
          role_id?: string | null
          search_query?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hh_sources_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hh_sources_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "specialist_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      import_runs: {
        Row: {
          created_at: string
          error_message: string | null
          finished_at: string | null
          id: string
          items_closed: number | null
          items_created: number | null
          items_found: number | null
          items_updated: number | null
          source_id: string
          started_at: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          items_closed?: number | null
          items_created?: number | null
          items_found?: number | null
          items_updated?: number | null
          source_id: string
          started_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          items_closed?: number | null
          items_created?: number | null
          items_found?: number | null
          items_updated?: number | null
          source_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_runs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "hh_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      job_skills: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          job_id: string
          skill_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          job_id: string
          skill_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          job_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          applications_count: number | null
          city: string | null
          company_id: string
          contract_type: Database["public"]["Enums"]["contract_type"] | null
          country: string | null
          created_at: string | null
          description: string
          expires_at: string | null
          external_id: string | null
          external_source: string | null
          external_url: string | null
          id: string
          is_relocatable: boolean | null
          is_remote: boolean | null
          level: Database["public"]["Enums"]["experience_level"] | null
          moderation_status: string | null
          requirements: string | null
          responsibilities: string | null
          role_id: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          source_id: string | null
          specialization_id: string | null
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          applications_count?: number | null
          city?: string | null
          company_id: string
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          country?: string | null
          created_at?: string | null
          description: string
          expires_at?: string | null
          external_id?: string | null
          external_source?: string | null
          external_url?: string | null
          id?: string
          is_relocatable?: boolean | null
          is_remote?: boolean | null
          level?: Database["public"]["Enums"]["experience_level"] | null
          moderation_status?: string | null
          requirements?: string | null
          responsibilities?: string | null
          role_id?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          source_id?: string | null
          specialization_id?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          applications_count?: number | null
          city?: string | null
          company_id?: string
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          country?: string | null
          created_at?: string | null
          description?: string
          expires_at?: string | null
          external_id?: string | null
          external_source?: string | null
          external_url?: string | null
          id?: string
          is_relocatable?: boolean | null
          is_remote?: boolean | null
          level?: Database["public"]["Enums"]["experience_level"] | null
          moderation_status?: string | null
          requirements?: string | null
          responsibilities?: string | null
          role_id?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          source_id?: string | null
          specialization_id?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "specialist_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "hh_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "specializations"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profile_skills: {
        Row: {
          created_at: string | null
          custom_group: string | null
          custom_name: string | null
          id: string
          is_custom: boolean | null
          is_top: boolean | null
          proficiency: number | null
          profile_id: string
          skill_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          custom_group?: string | null
          custom_name?: string | null
          id?: string
          is_custom?: boolean | null
          is_top?: boolean | null
          proficiency?: number | null
          profile_id: string
          skill_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          custom_group?: string | null
          custom_name?: string | null
          id?: string
          is_custom?: boolean | null
          is_top?: boolean | null
          proficiency?: number | null
          profile_id?: string
          skill_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_sports_experience: {
        Row: {
          context_level: string | null
          created_at: string | null
          id: string
          level: string | null
          profile_id: string
          role_in_sport: string | null
          sport_id: string
          years: number | null
        }
        Insert: {
          context_level?: string | null
          created_at?: string | null
          id?: string
          level?: string | null
          profile_id: string
          role_in_sport?: string | null
          sport_id: string
          years?: number | null
        }
        Update: {
          context_level?: string | null
          created_at?: string | null
          id?: string
          level?: string | null
          profile_id?: string
          role_in_sport?: string | null
          sport_id?: string
          years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_sports_experience_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_sports_experience_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_sports_open_to: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string
          sport_group: string | null
          sport_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id: string
          sport_group?: string | null
          sport_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string
          sport_group?: string | null
          sport_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_sports_open_to_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_sports_open_to_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          profile_id: string
          viewed_at: string
          viewer_user_id: string
        }
        Insert: {
          id?: string
          profile_id: string
          viewed_at?: string
          viewer_user_id: string
        }
        Update: {
          id?: string
          profile_id?: string
          viewed_at?: string
          viewer_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about_goals: string | null
          about_style: string | null
          about_useful: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string | null
          custom_role_id: string | null
          desired_city: string | null
          desired_contract_type: string | null
          desired_country: string | null
          desired_role_ids: string[] | null
          email: string | null
          first_name: string
          hide_current_org: boolean
          id: string
          is_public: boolean | null
          is_relocatable: boolean | null
          is_remote_available: boolean | null
          last_name: string
          level: Database["public"]["Enums"]["experience_level"] | null
          linkedin_url: string | null
          phone: string | null
          portfolio_url: string | null
          role_id: string | null
          search_status: Database["public"]["Enums"]["search_status"] | null
          secondary_role_id: string | null
          secondary_specialization_id: string | null
          show_contacts: boolean
          show_name: boolean
          specialization_id: string | null
          telegram: string | null
          updated_at: string | null
          user_id: string
          visibility_level: string
        }
        Insert: {
          about_goals?: string | null
          about_style?: string | null
          about_useful?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          custom_role_id?: string | null
          desired_city?: string | null
          desired_contract_type?: string | null
          desired_country?: string | null
          desired_role_ids?: string[] | null
          email?: string | null
          first_name: string
          hide_current_org?: boolean
          id?: string
          is_public?: boolean | null
          is_relocatable?: boolean | null
          is_remote_available?: boolean | null
          last_name: string
          level?: Database["public"]["Enums"]["experience_level"] | null
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          role_id?: string | null
          search_status?: Database["public"]["Enums"]["search_status"] | null
          secondary_role_id?: string | null
          secondary_specialization_id?: string | null
          show_contacts?: boolean
          show_name?: boolean
          specialization_id?: string | null
          telegram?: string | null
          updated_at?: string | null
          user_id: string
          visibility_level?: string
        }
        Update: {
          about_goals?: string | null
          about_style?: string | null
          about_useful?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          custom_role_id?: string | null
          desired_city?: string | null
          desired_contract_type?: string | null
          desired_country?: string | null
          desired_role_ids?: string[] | null
          email?: string | null
          first_name?: string
          hide_current_org?: boolean
          id?: string
          is_public?: boolean | null
          is_relocatable?: boolean | null
          is_remote_available?: boolean | null
          last_name?: string
          level?: Database["public"]["Enums"]["experience_level"] | null
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          role_id?: string | null
          search_status?: Database["public"]["Enums"]["search_status"] | null
          secondary_role_id?: string | null
          secondary_specialization_id?: string | null
          show_contacts?: boolean
          show_name?: boolean
          specialization_id?: string | null
          telegram?: string | null
          updated_at?: string | null
          user_id?: string
          visibility_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "specialist_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_secondary_role_id_fkey"
            columns: ["secondary_role_id"]
            isOneToOne: false
            referencedRelation: "specialist_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_secondary_specialization_id_fkey"
            columns: ["secondary_specialization_id"]
            isOneToOne: false
            referencedRelation: "specializations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "specializations"
            referencedColumns: ["id"]
          },
        ]
      }
      role_groups: {
        Row: {
          created_at: string | null
          id: string
          key: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      role_relations: {
        Row: {
          created_at: string | null
          id: string
          is_allowed: boolean
          primary_role_id: string
          secondary_role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_allowed?: boolean
          primary_role_id: string
          secondary_role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_allowed?: boolean
          primary_role_id?: string
          secondary_role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_relations_primary_role_id_fkey"
            columns: ["primary_role_id"]
            isOneToOne: false
            referencedRelation: "specialist_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_relations_secondary_role_id_fkey"
            columns: ["secondary_role_id"]
            isOneToOne: false
            referencedRelation: "specialist_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      specialist_roles: {
        Row: {
          created_at: string | null
          description: string | null
          group_id: string | null
          id: string
          is_active: boolean
          is_custom_allowed: boolean
          name: string
          name_en: string | null
          sort_order: number
          specialization_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          is_active?: boolean
          is_custom_allowed?: boolean
          name: string
          name_en?: string | null
          sort_order?: number
          specialization_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          is_active?: boolean
          is_custom_allowed?: boolean
          name?: string
          name_en?: string | null
          sort_order?: number
          specialization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialist_roles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "role_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_roles_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "specializations"
            referencedColumns: ["id"]
          },
        ]
      }
      specializations: {
        Row: {
          created_at: string | null
          group_key: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string | null
          group_key: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string | null
          group_key?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      sports: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_olympic: boolean | null
          name: string
          name_en: string | null
          season: string | null
          slug: string
          sort_order: number | null
          type_activity: string | null
          type_participation: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_olympic?: boolean | null
          name: string
          name_en?: string | null
          season?: string | null
          slug: string
          sort_order?: number | null
          type_activity?: string | null
          type_participation?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_olympic?: boolean | null
          name?: string
          name_en?: string | null
          season?: string | null
          slug?: string
          sort_order?: number | null
          type_activity?: string | null
          type_participation?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_applicant_to_my_jobs: {
        Args: { _profile_id: string }
        Returns: boolean
      }
      is_application_owner: {
        Args: { _application_id: string }
        Returns: boolean
      }
      is_company_owner: { Args: { _company_id: string }; Returns: boolean }
      is_job_owner: { Args: { _job_id: string }; Returns: boolean }
      is_profile_owner: { Args: { _profile_id: string }; Returns: boolean }
      is_profile_public: { Args: { _profile_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "specialist" | "employer" | "admin"
      application_status:
        | "pending"
        | "reviewed"
        | "shortlisted"
        | "interview"
        | "rejected"
        | "hired"
      contract_type:
        | "full_time"
        | "part_time"
        | "contract"
        | "internship"
        | "freelance"
      experience_level: "intern" | "junior" | "middle" | "senior" | "head"
      job_status: "draft" | "active" | "paused" | "closed"
      search_status:
        | "actively_looking"
        | "open_to_offers"
        | "not_looking"
        | "not_looking_but_open"
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
      app_role: ["specialist", "employer", "admin"],
      application_status: [
        "pending",
        "reviewed",
        "shortlisted",
        "interview",
        "rejected",
        "hired",
      ],
      contract_type: [
        "full_time",
        "part_time",
        "contract",
        "internship",
        "freelance",
      ],
      experience_level: ["intern", "junior", "middle", "senior", "head"],
      job_status: ["draft", "active", "paused", "closed"],
      search_status: [
        "actively_looking",
        "open_to_offers",
        "not_looking",
        "not_looking_but_open",
      ],
    },
  },
} as const
