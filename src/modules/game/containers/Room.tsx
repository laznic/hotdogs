import React, { useState } from 'react'

import tw from 'twin.macro'
import { useSupabase } from '../../../contexts/SupabaseContext';
import MyPlayerCard from "../components/MyPlayerCard";
import JoinLinkModal from '../components/JoinLinkModal';
import OtherPlayerCard from '../components/OtherPlayerCard';
import GameCompleteModal from '../components/GameCompleteModal';
import useFetchGameAndPlayers from '../hooks/useFetchGameAndPlayers';
import useHandleGameStates from '../hooks/useHandleGameStates';
import useHandlePlayerStates from '../hooks/useHandlePlayerStates';

export default function Room() {
  const { session } = useSupabase()
  const [emoji, setEmoji] = useState('😊')
  const [gameStatus, setGameStatus] = useState('OPEN')
  const [showJoinLinkModal, setShowJoinLinkModal] = useState(false)
  const gameStarted = gameStatus === 'IN_PROGRESS'
  
  const { game, participants, fetchPlayers } = useFetchGameAndPlayers(setGameStatus)
  const { seconds, countdown, disableLeaving, startGameCountdown } = useHandleGameStates(gameStatus, setGameStatus)
  const { myPlayerId } = useHandlePlayerStates(game, gameStatus, disableLeaving, fetchPlayers)
  
  const createdByMe = game?.created_by === session?.user?.id

  function isMe (userId: string, playerId: string | number) {
    return userId === session?.user?.id || playerId === myPlayerId
  }

  function toggleJoinLinkModal () {
    setShowJoinLinkModal(!showJoinLinkModal)
  }

  if (gameStatus === 'FINISHED') {
    return <GameCompleteModal isOpen />
  }

  if (!myPlayerId) {
    return (
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    )
  }

  return (
    <>
      {showJoinLinkModal && !gameStarted && <JoinLinkModal isOpen={showJoinLinkModal} toggleModal={toggleJoinLinkModal}  />}
      <Wrapper>
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
                    &nbsp;When everyone is ready,
                    <br />
                    <StartGameButton onClick={startGameCountdown}>start the game.</StartGameButton>
                  </>
                )}
              </p>
            </>
          )}

          {gameStatus === 'STARTING' && (
            <>
              <span className="text-xs text-white mt-8">Game starting in</span>
              <br />
              <CountDownText>
                {countdown}
              </CountDownText>
            </>
          )}

          {gameStatus === 'IN_PROGRESS' && (
            <CountDownText>
              {seconds}
            </CountDownText>
          )}
        </div>

        <PlayerCards>
          {!participants.filter((participant) => !isMe(participant.user_id, participant.id)).length && (
            <span className="text-rose-700">Waiting for other players</span>
          )}

          {participants.filter((participant) => !isMe(participant.user_id, participant.id)).map((participant) => (
            <OtherPlayerCard 
              key={participant.id} 
              id={participant.id} 
              username={participant.username} 
              hotDogs={participant.hotdogs} 
              ready={participant.ready} />
          ))}
        </PlayerCards>
      </Wrapper>
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

const Wrapper = tw.section`
  grid
  gap-12
  items-center
  mx-auto
  justify-center
`

const PlayerCards = tw.div`
  flex
  flex-wrap
  sm:flex-nowrap
  justify-evenly
  sm:w-1/2
  xl:w-3/4
  mx-auto
`

const CountDownText = tw.span`
  text-center
  text-9xl
  font-black
  text-white
  drop-shadow-xl
`