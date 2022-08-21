import React from 'react'
import tw from 'twin.macro'
import HotDog from './HotDog'

interface FaceBlockProps {
  emoji?: string
  currentHotDogBites?: number
  hotDogsEaten: number
}

export default function FaceBlock ({ emoji, currentHotDogBites, hotDogsEaten }: FaceBlockProps) {
  return (
    <Card>
      <Title>
        {emoji}
        <Count>{hotDogsEaten - 1}</Count>
      </Title>
      <HotDog bites={currentHotDogBites} />
    </Card>
  )
}

const Card = tw.div`
  bg-rose-50
  rounded-md
  p-4
  pr-0
`

const Title = tw.h2`
  flex
  items-center
  text-7xl
`

const Count = tw.span`
  font-black
  text-5xl
  ml-4
`