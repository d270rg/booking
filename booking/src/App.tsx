import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";
import { AuthPage } from "./pages/auth.page";
import { ConfirmationPage } from "./pages/confirmation.page";
import { EventDetailsPage } from "./pages/event-details.page";
import { EventsPage } from "./pages/events.page";
import { useEffect } from "react";
import { useEventsStore } from "./store/store";

const router = createBrowserRouter([
  {
    path: "/events",
    Component: EventsPage,
    children: [
      {
        path: "/event/:eventId",
        Component: EventDetailsPage,
      },
    ],
  },
  {
    path: "/confirmation",
    Component: ConfirmationPage,
  },
  {
    path: "/auth",
    Component: AuthPage,
  },
]);

function App() {
  const store = useEventsStore();

  useEffect(() => {
    store.getEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
