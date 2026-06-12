CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL UNIQUE,
    password text NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    eventId INT NOT NULL,
    status TEXT NOT NULL,
    reservationDate TIMESTAMP,
    reservedBy UUID,

    FOREIGN KEY (eventId) REFERENCES events(id),
    FOREIGN KEY (reservedBy) REFERENCES users(id)
);