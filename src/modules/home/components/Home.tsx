import { Session } from '@supabase/supabase-js'
import React, { useState, useEffect } from 'react'
import { useSupabase } from '../../../contexts/SupabaseContext'

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)

  const { client } = useSupabase()

  async function handleLogin () {

    await client.auth.signIn({
        provider: 'twitter'
     })
  }

  useEffect(() => {
    setSession(client.auth.session())

    client.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <>
      <p>{session ? `Welcome ${session.user?.user_metadata.preferred_username}` : <button onClick={handleLogin}>Login</button>}</p>
      <section className="grid grid-cols-4">
      </section>
    </>
  )
}