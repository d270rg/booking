USE APP_DB;

CREATE TABLE users {
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL UNIQUE,
    password text NOT NULL,

    INDEX idx_username (username)
};

CREATE TABLE events {
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
}

CREATE TABLE reservations {
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    eventId INT NOT NULL,
    reserved BOOL NOT NULL DEFAULT false,
    reservationDate DATE,
    reservedBy UUID,

    FOREIGN KEY (eventId) REFERENCES events(id),
    FOREIGN KEY (reservedBy) REFERENCES users(id)
}