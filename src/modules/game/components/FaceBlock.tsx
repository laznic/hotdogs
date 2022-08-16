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
      <h2 className="flex items-center text-7xl">
        {emoji}
        <span className="font-black text-5xl ml-4">{hotDogsEaten - 1}</span>
      </h2>
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