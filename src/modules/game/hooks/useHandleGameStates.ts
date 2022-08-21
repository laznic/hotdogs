import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { useTimer } from "react-timer-hook"
import addSeconds from 'date-fns/addSeconds'
import { useSupabase } from "../../../contexts/SupabaseContext"
import { Game } from "../types"

export default function useHandleGameStates(gameStatus: string, setGameStatus: (status: string) => void) {
  const [disableLeaving, setDisableLeaving] = useState(true)
  const { client, rpcQuery } = useSupabase()
  const now = useRef(new Date)
  const params = useParams()
  const { seconds, restart: restartTimer } = useTimer({ expiryTimestamp: now.current, autoStart: false })
  const { seconds: countdown, restart: restartCountdown } = useTimer({ expiryTimestamp: now.current, autoStart: false })

  async function startGameCountdown () {
    setDisableLeaving(true)
    await rpcQuery('start_game_countdown', { id: params?.id })
  }

  async function startGame () {
    await rpcQuery('start_game', { id: params?.id })
  }

  async function endGame() {
    await rpcQuery('end_game', { id: params?.id })
  }

  function handleGameState (payload: { new: Game }) {
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

  useEffect(function subscribeToGameState() {
    const subscription = client.from(`games:id=eq.${params?.id}`)
    .on('UPDATE', handleGameState)
    .subscribe()

    return () => {
      console.log('test')
      client.removeSubscription(subscription)
    }
  }, [])

  useEffect(function handleStartGame() {
    if (countdown === 0 && gameStatus === 'STARTING') {
      startGame()
    }
  }, [countdown, gameStatus])

  useEffect(function handleEndGame() {
    if (seconds === 0 && gameStatus === 'IN_PROGRESS') {
      endGame()
    }
  }, [seconds, gameStatus])

  return { seconds, countdown, disableLeaving, startGameCountdown }
}