import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSupabase } from '../../../contexts/SupabaseContext'
import { Game, Player } from '../types'

export default function useFetchGameAndPlayers (setGameStatus: (status: string) => void) {
  const [game, setGame] = useState<Game>() 
  const [participants, setParticipants] = useState<Player[]>([])
  const { rpcQuery, client } = useSupabase()
  const params = useParams()

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
      setGameStatus(data.status)
    }
  }

  async function fetchPlayers () {
    const { data, error } = await rpcQuery('fetch_participants', { game_id: params?.id })

    if (!error) {
      setParticipants(data)
    }
  }

  useEffect(function removeSubscriptions () {
    fetchGame()

    const subscription = client.from(`games_players:game=eq.${params?.id}`)
      .on('INSERT', fetchPlayers)
      .on('UPDATE', fetchPlayers)
      .on('DELETE', fetchPlayers)
      .subscribe()

    return () => {
      client.removeSubscription(subscription)
    }
  }, [])

  return { game, participants, fetchGame, fetchPlayers }
}