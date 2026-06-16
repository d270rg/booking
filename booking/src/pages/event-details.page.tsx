import { useParams } from "react-router";
import { useEventsStore } from "../store/store";
import { ReservationCard } from "../components/reservation-card.component";

export function EventDetailsPage() {
  const { eventId } = useParams();
  const reservations =
    useEventsStore((state) => (eventId ? state.events[eventId] : undefined)) ??
    [];

  return (
    <div>
      <div className="title">{reservations[0].eventName}</div>
      <div>
        {" "}
        {reservations.map((reservation) => (
          <ReservationCard
            key={reservation.reservationId}
            reservation={reservation}
          ></ReservationCard>
        ))}
      </div>
    </div>
  );
}
