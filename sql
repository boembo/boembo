CREATE TABLE lists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    list_id INT REFERENCES lists(id),
    sort_no INT 
);
