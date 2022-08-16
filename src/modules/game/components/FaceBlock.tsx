import React from 'react'
import tw from 'twin.macro'
import HotDog from './HotDog'

interface FaceBlockProps {
  emoji: string
  currentHotDogBites: number
}

export default function FaceBlock ({ emoji, currentHotDogBites }: FaceBlockProps) {
  return (
    <Card>
      <h2 className="text-7xl">{emoji}</h2>
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