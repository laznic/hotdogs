import Room from "../game/components/Room";
import Layout from "./components/Layout";
import NoMatch from "./components/NoMatch";

export default [
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/room", element: <Room /> },
      { path: "*", element: <NoMatch /> },
    ],
  },
];