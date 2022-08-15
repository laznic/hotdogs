import React from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

interface SupabaseContextType {
  client: SupabaseClient;
  rpcQuery: any
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function rpcQuery(rpc: string, params?: object) {
  return await supabase.rpc(rpc, params)
}

const SupabaseContext = React.createContext<SupabaseContextType>(null!)

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {

  const value = {
    client: supabase,
    rpcQuery
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  return React.useContext(SupabaseContext)
}