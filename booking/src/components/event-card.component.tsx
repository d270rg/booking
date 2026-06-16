import { useNavigate } from "react-router";
import type { IReservation } from "../models/event";
import { ReservationCard } from "./reservation-card.component";

interface IEventCardProps {
  eventId: string;
  reservations: IReservation[];
}

export function EventCard({ eventId, reservations }: IEventCardProps) {
  const naviagate = useNavigate();
  return (
    <div
      onClick={() => {
        naviagate(`event/${eventId}`);
      }}
    >
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.reservationId}
          reservation={reservation}
        ></ReservationCard>
      ))}
    </div>
  );
}
