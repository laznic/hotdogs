import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import addSeconds from 'date-fns/addSeconds'
import { useTimer } from 'react-timer-hook'
import tw from 'twin.macro'
import { useSupabase } from '../../../contexts/SupabaseContext';
import MyPlayerCard from "./MyPlayerCard";
import JoinLinkModal from './JoinLinkModal';
import OtherPlayerCard from './OtherPlayerCard';
import GameCompleteModal from './GameCompleteModal';

export default function Room() {
  const params = useParams()
  const { client, rpcQuery, session } = useSupabase()
  const [emoji, setEmoji] = useState('😊')
  const [participants, setParticipants] = useState([])
  const [gameStatus, setGameStatus] = useState('OPEN')
  const [game, setGame] = useState()
  const [myPlayerId, setMyPlayerId] = useState()
  const now = useRef(new Date)
  const [showJoinLinkModal, setShowJoinLinkModal] = useState(false)
  const gameStarted = gameStatus === 'IN_PROGRESS'
  const { seconds, restart: restartTimer } = useTimer({ expiryTimestamp: now.current, autoStart: false })
  const { seconds: countdown, restart: restartCountdown } = useTimer({ expiryTimestamp: now.current, autoStart: false })
  const navigate = useNavigate()
  const [disableLeaving, setDisableLeaving] = useState(true)
  
  function isMe (userId: string, playerId: string) {
    return userId === session?.user.id || playerId === myPlayerId
  }

  function handleGameState (payload: Record<string, unknown>) {
    if (payload.new.status === 'STARTING') {
      const countdownSeconds = addSeconds(new Date(), 5)
      restartCountdown(countdownSeconds, true)
    }

    if (payload.new.status === 'IN_PROGRESS') {
      const gameSeconds = addSeconds(new Date(), 15)
      restartTimer(gameSeconds, true)
    }

    setGameStatus(payload.new.status)
  }

  async function endGame() {
    await rpcQuery('end_game', { id: params?.id })
  }

  useEffect(function handleEndGame() {
    if (seconds === 0 && gameStatus === 'IN_PROGRESS') {
      endGame()
    }
  }, [seconds, gameStatus])

  async function startGame () {
    await rpcQuery('start_game', { id: params?.id })
  }

  async function startGameCountdown () {
    setDisableLeaving(true)
    await rpcQuery('start_game_countdown', { id: params?.id })
  }

  useEffect(function removeSubscriptions () {
    fetchGame()

    client.from(`games_players:game=eq.${params?.id}`)
      .on('INSERT', fetchPlayers)
      .on('UPDATE', fetchPlayers)
      .on('DELETE', fetchPlayers)
      .subscribe()

    client.from(`games:id=eq.${params?.id}`)
      .on('UPDATE', handleGameState)
      .subscribe()

    return () => {
      client.removeAllSubscriptions()
    }
  }, [])

  async function joinGame () {
    const { data, error } = await rpcQuery('join_game', { id: params?.id })

    if (!error) {
      setMyPlayerId(data)
    }
  }

  async function leaveGame () {
    await rpcQuery('leave_game', { id: myPlayerId })
  }

  useEffect(function handleGameJoining () {
    if (game && !myPlayerId) {
      if ((!game.private || (game.private && params?.code))) {
        joinGame()
      } else {
        navigate('/', { replace: true })
      }
    }

    return () => {
      if (myPlayerId && !disableLeaving) {
        leaveGame()
      }
    }
  }, [game, params?.code, myPlayerId, gameStatus])

  useEffect(function redirectUserIfStarted() {
    if (['STARTING', 'IN_PROGRESS', 'FINISHED'].some(status => status === gameStatus) && !myPlayerId) {
      navigate('/', { replace: true })
    }
  }, [gameStatus])

  useEffect(function startGameCountdown() {
    if (countdown === 0 && gameStatus === 'STARTING') {
      startGame()
    }
  }, [countdown, gameStatus])

  function toggleJoinLinkModal () {
    setShowJoinLinkModal(!showJoinLinkModal)
  }

  async function fetchGame () {
    const { data, error } = await client.from('games')
      .select(`
        id,
        private,
        status,
        created_by
      `)
      .eq('id', params?.id)
      .single()

    if (!error) {
      setGame(data)
      fetchPlayers()
    }
  }

  async function fetchPlayers () {
    const { data, error } = await rpcQuery('fetch_participants', { game_id: params?.id })

    if (!error) {
      setParticipants(data)
    }
  }

  if (!myPlayerId) {
    return (
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    )
  }
    
  if (gameStatus === 'FINISHED') {
    return <GameCompleteModal isOpen />
  }

  const createdByMe = game?.created_by === session?.user.id

  return (
    <>
      {showJoinLinkModal && !gameStarted && <JoinLinkModal isOpen={showJoinLinkModal} toggleModal={toggleJoinLinkModal}  />}
      <section className="grid gap-12 items-center mx-auto justify-center">
        <div className="max-w-sm mx-auto text-center">
          <MyPlayerCard emoji={emoji} setEmoji={setEmoji} gameStarted={gameStarted} />
          {!gameStarted && gameStatus !== 'STARTING' && (
            <>
              {createdByMe && (
                <ShowJoinCodeButton onClick={toggleJoinLinkModal}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Show join code
                </ShowJoinCodeButton>
              )}

              <p className="text-rose-900 font-semibold text-center mt-4">
                Check that your camera works by opening and closing your mouth: the emoji should react when you do so.
                {createdByMe && (
                  <>
                    When everyone is ready,
                    <br />
                    <StartGameButton onClick={startGameCountdown}>start the game.</StartGameButton>
                  </>
                )}
              </p>
            </>
          )}

          {gameStatus === 'STARTING' && (
            <span className="text-center text-9xl font-black text-white drop-shadow-xl">
              {countdown}
            </span>
          )}

          {gameStatus === 'IN_PROGRESS' && (
            <span className="text-center text-9xl font-black text-white drop-shadow-xl">
              {seconds}
            </span>
          )}
        </div>

        <div className="flex flex-wrap sm:flex-nowrap justify-evenly sm:w-1/2 xl:w-3/4 mx-auto">
          {!participants.filter((participant) => !isMe(participant.user_id, participant.id)).length && <span className="text-rose-700">Waiting for other players</span> }
          {participants.filter((participant) => !isMe(participant.user_id, participant.id)).map((participant) => (
            <OtherPlayerCard key={participant.id} id={participant.id} username={participant.username} hotDogs={participant.hotdogs} ready={participant.ready} gameStarted={gameStarted} />
          ))}
        </div>
      </section>
    </>
  )
}

const ShowJoinCodeButton = tw.button`
  inline-flex
  items-center
  font-semibold
  rounded-md
  text-rose-800
  hover:text-neutral-800
  py-2
  mt-4
`

const StartGameButton = tw.button`
  rounded
  bg-violet-500
  text-white
  border
  border-violet-600
  px-4
  py-2
  mt-4
  mb-6
  font-bold
  shadow-lg
  hover:-translate-y-1
  hover:shadow-xl
  transition-all
`