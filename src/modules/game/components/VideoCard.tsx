import React from 'react'
import tw from 'twin.macro'

export default function VideoCard() {
  return (
    <Card>
      Video card
    </Card>
  )
}

const Card = tw.div`
  rounded-md
  border-neutral-200
  border
  p-4
  bg-white
`