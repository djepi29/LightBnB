const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require('pg');

const pool = new Pool({
  user: 'djepi',
  host: 'localhost',
  database: 'lightbnb'
});

// Function to get a user by email from the database
const getUserWithEmail = function (email) {
  return pool
  .query(`SELECT * FROM users WHERE users.email = $1`, [email])
  .then((result) => {
    return result.rows[0];
  })
  .catch((error) => console.log(error.message))
};

// Function to get a user by ID from the database
const getUserWithId = function (id) {
  return pool
  .query(`SELECT * FROM users WHERE users.id = $1`, [id])
  .then((results) => {
   return results.rows[0]
  } 
  )
  .catch((error) => console.log(error.message))
};

// Function to add a new user to the database
const addUser = function (user) {
  return pool.query(`INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *`,[user.name, user.email, user.password])
  .then((results) => 
  results.rows[0])
  .catch((error) => console.log(error.message))
};

/// Reservations
// Function to get all reservations for a specific guest from the database
const getAllReservations = function (guest_id, limit = 10) {
  const params = [guest_id, limit]
  const queryString= `SELECT properties.*, reservations.*, avg(rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  AND reservations.end_date < now()::date
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2`
  return pool
  .query(queryString, params)
  .then((response) => {
    console.log(`response:`, response)
  return response.rows
})
  .catch((error) => console.log(`error:`, error.message))

};



// Function to get all properties based on search options from the database
const getAllProperties = function (options, limit) {
  const queryParams = [];


  let queryString = `SELECT properties.* , AVG(property_reviews.rating) as average_rating FROM properties JOIN property_reviews ON properties.id = property_id WHERE 1=1`

  // Check for search options and add corresponding conditions to the query
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `AND city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `AND owner_id = $${queryParams.length} `;
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    queryString += `AND cost_per_night >= $${queryParams.length} `;
    queryParams.push(options.maximum_price_per_night * 100);
    queryString += `AND cost_per_night <= $${queryParams.length} `;
  } else if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    queryString += `AND cost_per_night >= $${queryParams.length} `;
  } else if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    queryString += `AND cost_per_night <= $${queryParams.length} `;
  }

  queryString += `GROUP BY properties.id`
  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING AVG(rating) >= $${queryParams.length} `;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;


  return pool.query(queryString, queryParams).then((res) => res.rows);
};

// Function to add a new property to the database
 const addProperty = function (property) {
  const queryParams = [ property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night * 100, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms];

  let queryString = `
  INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *;
  `;

  return pool.query(queryString, queryParams).then((res) => res.rows[0]);
};

// Exporting the functions to be used in other modules
module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
