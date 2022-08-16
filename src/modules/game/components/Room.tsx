import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom';
import update from 'ramda/src/update'
import addSeconds from 'date-fns/addSeconds'
import { useTimer } from 'react-timer-hook'
import tw from 'twin.macro'
import { useSupabase } from '../../../contexts/SupabaseContext';
import MyPlayerCard from "./MyPlayerCard";
import JoinLinkModal from './JoinLinkModal';
import OtherPlayerCard from './OtherPlayerCard';

export default function Room({ viewMode }: { viewMode?: boolean }) {
  const params = useParams()
  const { client, rpcQuery, session } = useSupabase()
  const [emoji, setEmoji] = useState('😊')
  const [participants, setParticipants] = useState([])
  const [startingGame, setStartingGame] = useState(false)
  const [gameStatus, setGameStatus] = useState('OPEN')
  const [game, setGame] = useState()
  const time = useRef(addSeconds(new Date(), 30))
  const [showJoinLinkModal, setShowJoinLinkModal] = useState(true)
  
  function isMe (id: string) {
    return id === session?.user.id
  }

  function handlePlayerJoin (payload: Record<string, unknown>) {
    console.log(payload.new, participants)
    setParticipants(participants.concat([payload.new]))
  }

  function handlePlayerUpdate (payload: Record<string, unknown>) {
    const participantIndex = participants.findIndex((participant) => participant.id === payload.new.id)
    const updatedParticipants = update(participantIndex, payload.new, participants)

    setParticipants(updatedParticipants)
  }

  function handleGameState (payload: Record<string, unknown>) {
    setGameStatus(payload.new.status)
  }

  async function fetchParticipants() {
    const { data, error } = await client.from('games_players')
      .select()
      .eq('game', params?.id)
      
    if (!error) {
      setParticipants(data)
    }
  }

  const { seconds } = useTimer({ expiryTimestamp: time.current, autoStart: false })

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

  
  if (seconds === 0) {
    return <p>Time is up!</p>
  }

  useEffect(function removeSubscriptions () {
    fetchParticipants()
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
    }

    console.log(data)
  } 

  useEffect(() => {
    if (params?.code) {
      joinGame()
    }
  }, [params?.code])

  function toggleJoinLinkModal () {
    setShowJoinLinkModal(!showJoinLinkModal)
  }

  async function fetchGame () {
    const { data, error } = await rpcQuery('fetch_game', { id: params?.id })

    if (!error) {
      setGame(data)
    }
  } 

  return (
    <>
      {showJoinLinkModal && <JoinLinkModal isOpen={showJoinLinkModal} toggleModal={toggleJoinLinkModal}  />}
      <section className="grid gap-12 items-center mx-auto justify-center">

        <div className="max-w-sm mx-auto text-center">
        <MyPlayerCard emoji={emoji} setEmoji={setEmoji} />
          <span className="bg-sky-500 text-sky-50 font-extrabold w-full flex justify-center py-2 mt-4 rounded">You (@{session?.user?.user_metadata.preferred_username})</span>

          <ShowJoinCodeButton onClick={toggleJoinLinkModal}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Show join code
          </ShowJoinCodeButton>

          <p className="text-rose-900 font-semibold text-center">
            Check that your camera works by opening and closing your mouth. When everyone is ready,
            <StartGameButton>start the game.</StartGameButton>
          </p>

        </div>

        <div className="flex flex-wrap sm:flex-nowrap justify-evenly sm:w-1/2 xl:w-3/4 mx-auto">
          {!participants.filter((participant) => !isMe(participant.user_id)).length && <span className="text-rose-700">Waiting for other players</span> }
          {participants.filter((participant) => !isMe(participant.user_id)).map((participant) => (
            <OtherPlayerCard key={participant.id} hotDogs={participant.hotdogs} ready={participant.ready} />
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
  my-2
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