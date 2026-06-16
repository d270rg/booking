import { EventCard } from "../components/event-card.component";
import { useEventsStore } from "../store/store";

export function EventsPage() {
  const store = useEventsStore();

  return (
    <div>
      <ul>
        {Object.entries(store.events).map(([key, reservations]) => (
          <EventCard
            key={key}
            eventId={key}
            reservations={reservations}
          ></EventCard>
        ))}
      </ul>
    </div>
  );
}
