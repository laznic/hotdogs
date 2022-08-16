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

  async function fetchPublicGames () {
    const { data, error } = await client.from('games').select(`
      id,
      status,
      created_at,
      viewer_count,
      max_player_count,
      players:games_players (
        ready
      )
    `)
    .neq('status', 'FINISHED')
    .eq('private', false)
    .order('status', { ascending: true })
    
    if (error) {
      console.log(error)
      return
    }

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
      <h1 className="text-6xl font-black text-white drop-shadow-lg mb-4">
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
          {publicGames.map((game) => {
            return (
              <GameListItem key={game.id}>
                <div className="flex items-center flex-wrap">
                  <span className={'flex items-center gap-2 text-xs font-semibold bg-rose-50 px-4 py-3 rounded-l-full shadow-xl'}>
                    {renderStatusIcon(game.status)}
                    {game.status}
                  </span>
                  <span className={'flex items-center gap-2 font-semibold bg-rose-100 px-4 py-2 rounded-r-full shadow-xl'}>
                    {game.players.length} / {game.max_player_count} players | {game.viewer_count} viewers
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

                  <WatchButton to={`/rooms/${game.id}/view`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Watch
                  </WatchButton>
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
const WatchButton = tw(Link)`
  flex
  items-center
  rounded
  hocus:bg-rose-50
  border
  border-dashed
  border-rose-300
  hocus:border-white
  hocus:border-solid
  px-3
  py-2
  font-bold
  text-stone-700
  hocus:shadow-lg
  hocus:-translate-y-1
  transition-all
  hocus:text-slate-500
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