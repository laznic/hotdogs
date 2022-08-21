import React, { useState, useEffect, useRef, } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import tw from 'twin.macro'
import { useSupabase } from '../../../contexts/SupabaseContext'
import { Player } from '../types'

interface CreateGameModalProps {
  isOpen: boolean
}

export default function CreateGameModal ({ isOpen }: CreateGameModalProps) {
  const modalRef = useRef(null)
  const navigate = useNavigate()
  const { rpcQuery } = useSupabase()
  const [winningPlayer, setWinningPlayer] = useState<Player>()
  const params = useParams()

  async function fetchWinningPlayer () {
    const { data } = await rpcQuery('fetch_winning_player', { id: params?.id })
    setWinningPlayer(data)
  }

  function leaveGame () {
    navigate('/')
  }

  useEffect(() => {
    fetchWinningPlayer()
  }, [])

  if (!winningPlayer) {
    return null
  }

  return (
    <>
      <Backdrop />
      <Modal ref={modalRef} open={isOpen}>
        <section>
          <h2 className="font-bold text-xl mb-4 pb-4 text-center">Game finished!</h2>

          <section className="grid gap-4 mb-4 text-center">
            <span className="grid items-center justify-center text-4xl font-black text-amber-500">
              🏆
              <span>{winningPlayer.username ? winningPlayer.username : `Anon ${winningPlayer.id}`} wins</span>
              <span className="text-sm text-amber-500">They ate {winningPlayer.hotdogs.filter((hotdog) => hotdog.finished).length} hot dogs!</span>
            </span>

            <LeaveGameButton onClick={leaveGame}>Leave game</LeaveGameButton>
          </section>

        </section>
      </Modal>
    </>
  )
}

const Backdrop = tw.div`
  fixed
  top-0
  left-0
  right-0
  bottom-0
  backdrop-blur-lg
  backdrop-brightness-50
`

const Modal = tw.dialog`
  w-90vw
  max-w-lg
  bg-white
  rounded-lg
  p-4
  fixed
  top-1/2
  left-0
  right-0
  mx-auto
  -translate-y-1/2
  shadow-2xl
  text-left
`

const LeaveGameButton = tw.button`
  flex
  items-center
  justify-center
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
  transition-all
  active:bg-violet-700
  mt-4
`