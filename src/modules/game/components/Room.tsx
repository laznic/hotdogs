import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import update from 'ramda/src/update'
import addSeconds from 'date-fns/addSeconds'
import { useTimer } from 'react-timer-hook'
import tw from 'twin.macro'
import { useSupabase } from '../../../contexts/SupabaseContext';
import MyPlayerCard from "./MyPlayerCard";
import JoinLinkModal from './JoinLinkModal';
import OtherPlayerCard from './OtherPlayerCard';

export default function Room() {
  const params = useParams()
  const { client, rpcQuery, session } = useSupabase()
  const [emoji, setEmoji] = useState('😊')
  const [participants, setParticipants] = useState([])
  const [gameStatus, setGameStatus] = useState('OPEN')
  const [game, setGame] = useState()
  const [myPlayerId, setMyPlayerId] = useState()
  const now = useRef(new Date)
  const [showJoinLinkModal, setShowJoinLinkModal] = useState()
  const gameStarted = gameStatus === 'IN_PROGRESS'
  const { seconds, restart: restartTimer } = useTimer({ expiryTimestamp: now.current, autoStart: false })
  const { seconds: countdown, restart: restartCountdown } = useTimer({ expiryTimestamp: now.current, autoStart: false })
  const navigate = useNavigate()
  
  function isMe (userId: string, playerId: string) {
    return userId === session?.user.id || playerId === myPlayerId
  }

  function handlePlayerJoin (payload: Record<string, unknown>) {
    setParticipants(participants.concat([payload.new]))
  }

  function handlePlayerUpdate (payload: Record<string, unknown>) {
    const participantIndex = participants.findIndex((participant) => participant.id === payload.new.id)
    const updatedParticipants = update(participantIndex, payload.new, participants)

    setParticipants(updatedParticipants)
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
    await rpcQuery('start_game_countdown', { id: params?.id })
  }

  useEffect(function removeSubscriptions () {
    fetchGame()

    client.from(`games_players:game=eq.${params?.id}`)
      .on('INSERT', handlePlayerJoin)
      .on('UPDATE', handlePlayerUpdate)
      .subscribe()

    client.from(`games:id=eq.${params?.id}`)
      .on('UPDATE', handleGameState)
      .subscribe()

    return () => {
      console.log('unmount?')
      client.removeAllSubscriptions()
    }
  }, [])

  async function joinGame () {
    const { data, error } = await rpcQuery('join_game', { id: params?.id })

    if (error) {
      console.log(error)
      return
    }

    setMyPlayerId(data)
  } 

  useEffect(function handleGameJoining () {
    if (game && (!game.private || params?.code) && !myPlayerId) {
      joinGame()
    } else {
      navigate('/', { replace: true })
    }
  }, [game, params?.code, myPlayerId])

  useEffect(function redirectUserIfStarted() {
    if (['STARTING', 'IN_PROGRESS', 'FINISHED'].some(status => status === gameStatus)) {
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

  async function  fetchGame () {
    const { data, error } = await rpcQuery('fetch_game', { id: params?.id })

    if (!error) {
      const { participants } = data
      setGame(data)
      setParticipants(participants)
    }
  }
    
  if (seconds === 0 && gameStarted) {
    return <p>Time is up!</p>
  }

  const createdByMe = game?.created_by === session?.user.id

  return (
    <>
      {showJoinLinkModal && !gameStarted && <JoinLinkModal isOpen={showJoinLinkModal} toggleModal={toggleJoinLinkModal}  />}
      <section className="grid gap-12 items-center mx-auto justify-center">

        <div className="max-w-sm mx-auto text-center">
        <MyPlayerCard emoji={emoji} setEmoji={setEmoji} gameStarted={gameStarted} />
          <span className="bg-sky-500 text-sky-50 font-extrabold w-full flex justify-center py-2 mt-4 rounded">You (@{session?.user?.user_metadata.preferred_username})</span>
          {!gameStarted && (
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
        </div>

        <div className="flex flex-wrap sm:flex-nowrap justify-evenly sm:w-1/2 xl:w-3/4 mx-auto">
          {!participants.filter((participant) => !isMe(participant.user_id, participant.id)).length && <span className="text-rose-700">Waiting for other players</span> }
          {participants.filter((participant) => !isMe(participant.user_id, participant.id)).map((participant) => (
            <OtherPlayerCard key={participant.id} hotDogs={participant.hotdogs} ready={participant.ready} gameStarted={gameStarted} />
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
  hover:-translate-y-2
  hover:shadow-xl
  transition-all
`