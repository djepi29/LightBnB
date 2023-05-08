-- SELECT reservations.id as id, title, cost_per_night, start_date, AVG(property_reviews.rating) as average_rating
-- FROM properties
-- JOIN reservations ON properties.id = reservations.property_id
-- JOIN property_reviews ON reservations.id = reservation_id
-- WHERE properties.owner_id = 1
-- GROUP BY reservations.id, title, cost_per_night, start_date
-- ORDER BY start_date
-- LIMIT 10;

SELECT reservations.id, properties.title, properties.cost_per_night, reservations.start_date, avg(rating) as average_rating
FROM reservations
JOIN properties ON reservations.property_id = properties.id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = 1
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date
LIMIT 10;