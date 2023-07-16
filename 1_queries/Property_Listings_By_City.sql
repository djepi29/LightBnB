-- SELECT id, title, cost_per_night, AVG(rating)
-- FROM properties
-- WHERE city = 'Vancouver'
-- LEFT JOIN property_reviews ON properties.id = property_id
-- WHERE rating >= 4
-- GROUP BY title
-- ORDER BY cost_per_night
-- LIMIT 10

SELECT properties.id, title, cost_per_night, ROUND(avg(property_reviews.rating),1) as average_rating
FROM properties
LEFT JOIN property_reviews ON properties.id = property_id
WHERE city LIKE '%ancouv%'
GROUP BY properties.id
HAVING avg(property_reviews.rating) >= 4
ORDER BY cost_per_night
LIMIT 10;

-- SELECT properties.id, title, cost_per_night, AVG(rating)
-- FROM properties
-- LEFT JOIN property_reviews ON properties.id = property_reviews.property_id
-- WHERE city = 'Vancouver' AND rating >= 4
-- GROUP BY properties.id, title, cost_per_night
-- ORDER BY cost_per_night
-- LIMIT 10;