import { useEffect, useState } from "react"
import { useSupabase } from "../../../contexts/SupabaseContext"

export default function Leaderboard () {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const { client } = useSupabase()

  async function fetchLeaderboard () {
    setLoading(true)
    const { data, error } = await client.from('leaderboard').select()
    
    if (error) {
      console.log(error)
      return
    }
    
    setLoading(false)
    setLeaderboard(data ?? [])
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  return (
    <div className="grid items-center justify-center pt-24">
        <section className="rounded-lg bg-rose-50 p-8 border border-white shadow-xl w-96">
          <h1 className="text-4xl font-black">Leaderboard</h1>
          <p className="text-sm">Players with number of hot dogs they've eaten so far</p>

          <ul className="w-full overflow-hidden mt-4 gap-2">
            {loading && (
              <svg className="animate-spin h-5 w-5 text-neutral-500 mx-auto text-center" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {leaderboard.map((entry, index) => (
              <li className="flex items-center justify-between border-b border-dashed border-stone-300 last-of-type:border-none">
                <span className="overflow-ellipsis whitespace-nowrap overflow-hidden">
                  {index + 1}. &nbsp;
                  {entry.username}
                </span>

                <span className="flex-shrink-0 font-bold">
                  {entry.finished_hotdogs}
                </span>
              </li>
            ))}
          </ul>
        </section>
    </div>
  )
}

type LeaderboardEntry = {
  username: string
  finished_hotdogs: number
}