CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    username text NOT NULL UNIQUE,
    password text NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name text NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    eventId UUID NOT NULL,
    index INT NOT NULL,
    status TEXT NOT NULL,
    reservationDate TIMESTAMP,
    reservedBy UUID,
    FOREIGN KEY (eventId) REFERENCES events (id),
    FOREIGN KEY (reservedBy) REFERENCES users (id)
);