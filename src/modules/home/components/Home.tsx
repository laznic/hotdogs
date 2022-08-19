import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import tw from 'twin.macro'

import { useSupabase } from '../../../contexts/SupabaseContext'
import LoginModal from '../../auth/components/LoginModal'
import CreateGameModal from '../../game/components/CreateGameModal'

export default function Home() {
  const { client, session } = useSupabase()
  const [publicGames, setPublicGames] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(false)

  async function fetchPublicGames () {
    setLoading(true)
    const { data, error } = await client.from('games').select(`
      id,
      status,
      created_at,
      max_player_count,
      players:games_players (
        ready
      )
    `)
    .eq('status', 'OPEN')
    .eq('private', false)
    .order('status', { ascending: true })
    
    if (error) {
      console.log(error)
      return
    }
    
    setLoading(false)
    setPublicGames(data)
  }

  useEffect(() => {
    fetchPublicGames()
  }, [])

  function toggleCreateModal () {
    setShowCreateModal(!showCreateModal)
  }

  return (
    <div className="text-center">
      <h1 className="text-6xl font-black text-rose-900 mb-4">
        <span className="block text-center mb-4">😄🌭</span>
        The Hot Dog Game
      </h1>

      <p className="mb-4">
        The rules are simple: 
        <span className="font-bold">
          &nbsp;eat as many hot dogs as you can in 15 seconds.
        </span>
      </p>

      {session && <CreateGameButton onClick={toggleCreateModal}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Create a game
        </CreateGameButton>}
      {!session && <LoginModal />}

      {showCreateModal && (
        <CreateGameModal isOpen={showCreateModal} toggleModal={toggleCreateModal} />
      )}
      
      <section className="mt-16">
        <h3 className="text-3xl font-bold text-center text-rose-900">Or check out some of the public games 👇</h3>
        <GameList>
          {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-rose-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          }
          {!loading && !publicGames.filter((game) => game.players.length < game.max_player_count).length && <p className="text-rose-800">No public games available.</p>}
          {!loading && publicGames.filter((game) => game.players.length < game.max_player_count).map((game) => {
            return (
              <GameListItem key={game.id}>
                <div className="flex items-center flex-wrap">
                  <span className={'flex items-center gap-2 text-xs font-semibold bg-rose-50 px-4 py-3 rounded-l-full shadow-xl'}>
                    {renderStatusIcon(game.status)}
                    {game.status}
                  </span>
                  <span className={'flex items-center gap-2 font-semibold bg-rose-100 px-4 py-2 rounded-r-full shadow-xl'}>
                    {game.players.length} / {game.max_player_count} players
                  </span>
                </div>

                <div className={'flex flex-wrap items-center justify-center gap-2'}>
                  {game.status === 'OPEN' && game.players.length < game.max_player_count && (
                    <JoinButton to={`/rooms/${game.id}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Join
                    </JoinButton>
                  )}
                </div>

              </GameListItem>
            )
          })} 
        </GameList>
      </section>
    </div>
  )
}

function renderStatusIcon (status: string) {
  if (status === 'OPEN') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
      </svg>
    )
  }
  
  if (status === 'STARTING') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )
  }

  if (status === 'IN_PROGRESS') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
}

const GameList = tw.ul`
  grid
  gap-12
  w-full
  mt-12
  pb-12
  justify-center
`
const GameListItem = tw.li`
  grid
  justify-center
  gap-6
  mx-auto
`

const JoinButton = tw(Link)`
  flex
  items-center
  rounded
  bg-rose-50
  border
  border-solid
  border-white
  px-3
  py-2
  font-bold
  text-stone-700
  shadow-md
  hocus:-translate-y-1
  transition-all
  hocus:text-emerald-600
  hocus:shadow-lg
`

const CreateGameButton = tw.button`
  inline-flex
  items-center
  rounded-lg
  bg-violet-500
  border
  border-solid
  border-violet-600
  px-10
  pl-6
  py-4
  text-lg
  font-bold
  text-violet-50
  shadow-md
  hocus:-translate-y-1
  transition-all
  hocus:text-white
  hocus:shadow-lg
  active:bg-violet-700
  sticky
  top-4
`