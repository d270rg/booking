import type { IReservation } from "../models/event";
import "./reservation-card.component.css";

interface IReservationCardProps {
  reservation: IReservation;
}

export function ReservationCard({ reservation }: IReservationCardProps) {
  return (
    <div>
      {
        <div className={reservation.reserved ? `reserved` : `free`}>
          {reservation.index}
        </div>
      }
    </div>
  );
}
