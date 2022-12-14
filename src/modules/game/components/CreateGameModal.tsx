import React, { useState, useRef, ChangeEvent, } from 'react'
import { useNavigate } from 'react-router-dom'
import tw, { styled } from 'twin.macro'
import { useSupabase } from '../../../contexts/SupabaseContext'
import useOnClickOutside from '../../../shared/hooks/useOnClickOutside'

interface CreateGameModalProps {
  toggleModal: () => void
  isOpen: boolean
}

export default function CreateGameModal ({ toggleModal, isOpen }: CreateGameModalProps) {
  const [privateGame, setPrivateGame] = useState(true)
  const [maxPlayers, setMaxPlayers] = useState<string | number>(2)
  const modalRef = useRef(null)
  const navigate = useNavigate()
  const { rpcQuery } = useSupabase()
  const [error, setError] = useState(false)
  const [creating, setCreating] = useState(false)

  useOnClickOutside(modalRef, toggleModal)

  function togglePrivacy () {
    setPrivateGame(!privateGame)
  }

  function handleMaxPlayerCount (event: ChangeEvent<HTMLInputElement>) {
    const { value } = event.target

    const valueAsNumber = parseInt(value)

    if (Object.is(NaN, valueAsNumber)) {
      setMaxPlayers('')
      return
    }

    if (valueAsNumber >= 5) {
      setMaxPlayers(5)
      return
    }

    setMaxPlayers(valueAsNumber)
  }

  async function createRoom () {
    if (creating) return

    setError(false)
    setCreating(true)

    const { data, error } = await rpcQuery('create_game', { 
      private: privateGame,
      max_player_count: maxPlayers
    })

    setCreating(false)

    if (error) {
      setError(true)
      return
    }

    navigate(`/rooms/${data.id}/${data.code}`)
  }

  return (
    <>
      <Backdrop />
      <Modal ref={modalRef} open={isOpen}>
        <Title>Create a game</Title>

        <ModalBody>
          <InputWrapper>
            <FlexCol>
              <span className="text-sm font-medium text-gray-900 mr-2">Max. players</span>
              <span className="text-sm text-gray-500">
                You can have up to 5 players in one game.
              </span>
            </FlexCol>
            <MaxPlayersInput type="number" placeholder="2" min={1} max={5} onChange={handleMaxPlayerCount} value={maxPlayers}/>
          </InputWrapper>

          <InputWrapper>
            <FlexCol>
              <span className="text-sm font-medium text-gray-900">
                Private game
              </span>

              <span className="text-sm text-gray-500">
                Private game doesn't show up in lists, and only people with the room token*
                can join in. 
              </span>

              <span className="text-xs text-gray-500 mt-2">
                * join link with the token is presented to you after creating the game
              </span>
            </FlexCol>

            <ToggleButton onClick={togglePrivacy} type="button" toggled={privateGame} role="switch" aria-checked="false" aria-labelledby="availability-label" aria-describedby="availability-description">
              <ToggleButtonHandle toggled={privateGame} aria-hidden="true"></ToggleButtonHandle>
            </ToggleButton>
          </InputWrapper>

          {error && <ErrorMessage>Error occured when creating a room, try again.</ErrorMessage>}
          
          <CreateGameButton onClick={createRoom}>
            {creating && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}

            Create
          </CreateGameButton>
        </ModalBody>
      </Modal>
    </>
  )
}

const ToggleButton = styled.button(({ toggled }: { toggled: boolean }) => [
  toggled ? tw`bg-emerald-500` : tw`bg-gray-200`,
  tw`
    relative
    inline-flex
    flex-shrink-0
    h-6
    w-11
    border-2
    border-transparent
    rounded-full
    cursor-pointer
    transition-colors
    ease-in-out
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    focus:ring-emerald-500
  `
])

const ToggleButtonHandle = styled.span(({ toggled }: { toggled: boolean }) => [
  toggled ? tw`translate-x-5` : tw`translate-x-0`,
  tw`
    pointer-events-none
    inline-block
    h-5
    w-5
    rounded-full
    bg-white
    shadow
    transform
    ring-0
    transition
    ease-in-out
    duration-200
  `
])

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

const Title = tw.h2`
  font-bold
  text-xl
  mb-4
  border-b
  pb-4
`

const ModalBody = tw.section`
  grid
  gap-4
  mb-4
`

const InputWrapper = tw.div`
  flex
  items-center
  gap-4
  justify-between
`

const FlexCol = tw.div`
  flex-grow
  flex
  flex-col
`

const MaxPlayersInput = tw.input`
  rounded-xl
  w-16
  py-1
  border-neutral-300
`

const CreateGameButton = tw.button`
  inline-flex
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
`

const ErrorMessage = tw.span`
  text-xs
  text-red-500
`