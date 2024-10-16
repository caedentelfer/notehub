const axios = require('axios');

// Make a request to the Python backend that returns a 204 response
axios.get('http://localhost:5000/no-content')
  .then(response => {
    console.log('Status Code:', response.status);  // Should log 204
    console.log('Response Body:', response.data);  // Expecting empty body
  })
  .catch(error => {
    console.error('An error occurred:', error.message);
  });