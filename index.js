const axios = require('axios');

axios.get('https://api.github.com/repos/nodejs/node')
  .then(response => {
    console.log(`Repository: ${response.data.full_name}`);
    console.log(`Description: ${response.data.description}`);
    console.log(`Stars: ${response.data.stargazers_count}`);
    console.log(`Forks: ${response.data.forks_count}`);
  })
  .catch(error => {
    console.error(`Error fetching data: ${error}`);
  });
