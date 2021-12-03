const request = require('request');

const nextISSTimesForMyLocation = function(callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) {
      return callback(error, null);
    }

    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
  
    const ip = JSON.parse(body).ip;
    request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {
          
      if (error) {
        callback(error, null);
        return;
      }
      
      if (response.statusCode !== 200) {
        callback(Error(`Status Code ${response.statusCode} when fetching coordinates for IP: ${body}`), null);
        return;
      }
      
      const coords = JSON.parse(body);
      request(`https://iss-pass.herokuapp.com/json/?lat=${coords["latitude"]}&lon=${coords["longitude"]}`, (error, response, body) => {
        
        if (error) {
          callback(error, null);
          return;
        }
          
        if (response.statusCode !== 200) {
          callback(Error(`Status Code ${response.statusCode} when fetching ISS fly over times`, null))
          return;
        }
          
        const flyOverTimes = JSON.parse(body)["response"];
        callback(null, flyOverTimes);
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation };


/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
/*const fetchMyIP = function(callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {

    // inside the request callback ...
    // error can be set if invalid domain, user is offline, etc.
    if (error) {
      return callback(error, null);
    }

    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(null, ip);
  // if we get here, all's well and we got the data
  });
  // use request to fetch IP address from JSON API
};


const fetchCoordsByIP = (ip, callback) => {
  request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching coordinates for IP: ${body}`), null);
      return;
    }

    const {latitude, longitude} = JSON.parse(body);

    callback(null, {latitude, longitude});
  });
};

const fetchISSFlyOverTimes = (coords, callback) => {
  request(`https://iss-pass.herokuapp.com/json/?lat=${coords["latitude"]}&lon=${coords["longitude"]}`, (error, response, body) => {
    if (error) {
      callback(error, null);
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS fly over times`, null))
      return;
    }

    const flyOverTimes = JSON.parse(body)["response"];
    callback(null, flyOverTimes);
  });
};


// iss.js 

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */ 