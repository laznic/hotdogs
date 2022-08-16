import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom';
import update from 'ramda/src/update'
import addSeconds from 'date-fns/addSeconds'
import { useTimer } from 'react-timer-hook'
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
      <button onClick={toggleJoinLinkModal}>Show join code</button>
      <section className="grid gap-12 items-center mx-auto justify-center">
        {showJoinLinkModal && <JoinLinkModal isOpen={showJoinLinkModal} toggleModal={toggleJoinLinkModal}  />}

        <div className="max-w-sm mx-auto">
          <MyPlayerCard emoji={emoji} setEmoji={setEmoji} />
          <span className="bg-violet-500 text-white font-extrabold w-full flex justify-center py-2 mt-4 rounded">You (@{session?.user?.user_metadata.preferred_username})</span>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap justify-evenly sm:w-1/2 xl:w-3/4 mx-auto">
          {participants.filter((participant) => !isMe(participant.user_id)).map((participant) => (
            <OtherPlayerCard key={participant.id} hotDogs={participant.hotdogs} />
          ))}
        </div>
      </section>
    </>
  )
}