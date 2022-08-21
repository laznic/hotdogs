import Room from "../game/containers/Room";
import Home from "../home/components/Home";
import Leaderboard from "../leaderboard/containers/Leaderboard";
import Layout from "./components/Layout";
import NoMatch from "./components/NoMatch";

export default [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "/rooms/:id", element: <Room /> },
      { path: "/rooms/:id/:code", element: <Room /> },
      { path: "/leaderboard", element: <Leaderboard /> },
      { path: "*", element: <NoMatch /> },
    ],
  },
];