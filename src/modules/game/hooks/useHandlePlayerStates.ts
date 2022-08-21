import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSupabase } from '../../../contexts/SupabaseContext'
import { Game } from '../types'

export default function useHandlePlayerStates (game: Game | undefined, gameStatus: string, disableLeaving: boolean, fetchPlayers: () => void) {
  const [myPlayerId, setMyPlayerId] = useState()
  const  { rpcQuery } = useSupabase()
  const params = useParams()
  const navigate = useNavigate()
  const startingInProgressOrDone = ['STARTING', 'IN_PROGRESS', 'FINISHED'].some(status => status === gameStatus)
  const privateButNoCode = game?.private && !params?.code
  const publicOrPrivateAndHasCode = !game?.private || (game?.private && params?.code)

  async function joinGame () {
    const { data, error } = await rpcQuery('join_game', { id: params?.id })

    if (!error) {
      setMyPlayerId(data)
      fetchPlayers()
    }
  }

  async function leaveGame () {
    await rpcQuery('leave_game', { id: myPlayerId })
  }

  useEffect(function handleGameJoining () {
    if (game && !myPlayerId) {
      if (privateButNoCode) {
        navigate('/', { replace: true })
      }

      if (publicOrPrivateAndHasCode && !startingInProgressOrDone) {
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
  }, [game, privateButNoCode, myPlayerId, disableLeaving, startingInProgressOrDone])

  return { myPlayerId }
}