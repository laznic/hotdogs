import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom';
import update from 'ramda/src/update'
import { useSupabase } from '../../../contexts/SupabaseContext';
import VideoCard from "./VideoCard";

export default function Room({ viewMode }: { viewMode?: boolean }) {
  const params = useParams()
  const { client, rpcQuery } = useSupabase()
  const [emoji, setEmoji] = useState('😊')
  const [participants, setParticipants] = useState([])
  const [startingGame, setStartingGame] = useState(false)
  const [gameStatus, setGameStatus] = useState('OPEN')

  const gameSubscription = useRef(client.from(`games:id=eq.${params?.id}`)
    .on('UPDATE', handleGameState)
    .subscribe()
  )
  const participantsSubscription = useRef(client.from(`games_players:game=eq.${params?.id}`)
    .on('INSERT', handlePlayerJoin)
    .on('UPDATE', handlePlayerUpdate)
    .subscribe()
  )

  function handlePlayerJoin (payload: Record<string, unknown>) {
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

  useEffect(function removeSubscriptions () {
    return () => {
      gameSubscription.current && client.removeSubscription(gameSubscription.current)
      participantsSubscription.current && client.removeSubscription(participantsSubscription.current)
    }
  }, [])

  async function joinGame () {
    console.log(params)

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
  }, [params])

  return (
    <>
      <section className="grid grid-cols-4">
        <VideoCard emoji={emoji} setEmoji={setEmoji} gameStatus={gameStatus} />
      </section>
    </>
  )
}