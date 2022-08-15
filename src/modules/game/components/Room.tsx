import React from 'react'
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSupabase } from '../../../contexts/SupabaseContext';
import VideoCard from "./VideoCard";

export default function Room({ viewMode }: { viewMode?: boolean }) {
  const params = useParams()

  const { rpcQuery } = useSupabase()

  async function joinGame () {
    console.log(params)

    const { data, error } = await rpcQuery('join_game', { id: params?.id })
    if (error) {
      console.log(error)
    }

    console.log(data)
  } 

  useEffect(() => {
    if (params?.code) {
      joinGame()
    }
  }, [params])

  return (
    <>
      <p>room</p>
      <section className="grid grid-cols-4">
        <VideoCard />
      </section>
    </>
  )
}