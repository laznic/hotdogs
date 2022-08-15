import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from '../../../contexts/SupabaseContext'

export default function Home() {
  const { client, session } = useSupabase()
  const navigate = useNavigate()

  async function handleLogin () {
    await client.auth.signIn({
        provider: 'twitter'
     })
  }

  async function handleLogout () {
    await client.auth.signOut()
  }

  async function createRoom () {
    const { data, error } = await client.from('games').insert({
      code: 'asdlol123',
      private: false
    })

    if (error) {
      console.log(error)
      return
    }

    const [game] = data
    navigate(`/rooms/${game.id}/${game.code}`)
  }

  return (
    <>
      <p>{session ? <>{`Welcome ${session.user?.user_metadata.preferred_username}`}<button onClick={handleLogout}>Logout</button></> : <button onClick={handleLogin}>Login</button>}</p>
      {session && <button onClick={createRoom}>Create game</button>}
      <section className="grid grid-cols-4">
      </section>
    </>
  )
}