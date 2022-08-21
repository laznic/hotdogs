export type Player = {
  id: number | string
  username: string
  user_id: string
  ready: boolean
  hotdogs: HotDog[]
}

export type HotDog = {
  bites: number
  finished: boolean
}

export type Game = {
  private: boolean
  created_by: string
  status: string
  id: string | number
  max_player_count: number
  players: Player[]
}