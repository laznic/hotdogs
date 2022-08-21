# [That Hot Dog Game 🌭](https://thathotdoggame.com)

## Eat as many hot dogs as you can in 15 seconds.

Compete against friends (up to 5 people) in private matches, or join public games with anyone.

**NOTE:** This does not work as nicely with mobile devices as it does with desktops and laptops.

<sup>Made for Supabase Launch Week 5 Hackathon.</sup> 

Built with
- [Supabase](https://supabase.com)
- [React](https://reactjs.org/)
- [FaceAPI](https://github.com/vladmandic/face-api)
- [twin.macro](https://github.com/ben-rogerson/twin.macro)

## How it works

Uses webcam to detect users face, and to determine when their mouth is opened or closed.
With this in mind, you have to "eat" as many hot dogs as you can within 15 seconds.
Three bites equals one eaten hot dog. 
 
The game uses Supabase to store game data, authenticate users (via Twitter login for now), and provides the real-time capabilities.

You're able to create private (which will use a join link) or public matches which allow anyone to participate (no login required!).

Also comes with a small leaderboard to see who has been eaten the most hot dogs.

## Motivation

Just for fun! Have had this idea for a while, and wanted to finally participate in one of Supabase's hackathons. 

## Ideas for the future

Some features that were left out from the first release to be able to finish it during the hackathon:

- Game viewers (watch game without playing)
- Cheering / reacting in a game (mainly for viewers to root for their favorite player)
- Update to Supabase JS v2
- Direct SoMe sharing with a dynamic graphic
- Animations / transitions
- Live web cam feeds from all players (maybe via [Daily](https://daily.co)?)
- General performance improvements and other adjustments

## The team / contributors
- laznic ([GitHub](https://github.com/laznic), [Twitter](https://twitter.com/laznic))
