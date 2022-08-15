import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from '../../../contexts/SupabaseContext'
import LoginModal from '../../auth/components/LoginModal'

export default function Home() {
  const { client, session } = useSupabase()
  const navigate = useNavigate()
  const [publicGames, setPublicGames] = useState([])

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

  async function fetchPublicGames () {
    const { data, error } = await client.from('games').select(`
      id,
      status,
      created_at,
      viewer_count,
      max_player_count,
      players:games_players (
        ready,
        hotdogs
      )
    `)
    .order('id', { ascending: false })
    .neq('status', 'FINISHED')
    .eq('private', false)
    
    if (error) {
      console.log(error)
      return
    }

    console.log(data)

    setPublicGames(data)
  }

  useEffect(() => {
    fetchPublicGames()
  }, [])

  return (
    <>
      <p>{session ? <>{`Welcome ${session.user?.user_metadata.preferred_username}`}<button onClick={handleLogout}>Logout</button></> : <button onClick={handleLogin}>Login</button>}</p>
      {session && <button onClick={createRoom}>Create game</button>}
      {!session && <LoginModal />}
      <section className="mt-8">
        <h3 className="text-3xl font-bold text-center text-rose-900">Or join some of the public games 👇</h3>
        <ul>
          {publicGames.map((game) => {
            return (
              <li key={game.id}>
                {game.status} | {game.players.length} / {game.max_player_count} players | {game.viewer_count} people viewing
              </li>
            )
          })} 
        </ul>
      </section>
    </>
  )
}