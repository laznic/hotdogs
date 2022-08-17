import Room from "../game/components/Room";
import Home from "../home/components/Home";
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
      { path: "*", element: <NoMatch /> },
    ],
  },
];