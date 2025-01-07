// const express = require("express");
// const router = express.Router();
// const express = require('express');
// const { getApiData } = require('../controllers/openBankingController');

// // Endpoint de exemplo
// router.get('/api-data', getApiData);
// router.get("/health", (req, res) => {
//   res.status(200).json({ status: "API is running" });
// });

// module.exports = router;

//-----------------------------------//
const express = require('express');  

const app = express();

const axios = require('axios');

const fetchApiData = async () => {
  try {
    const url = 'https://data.directory.openbankingbrasil.org.br/participants';
    const response = await axios.get(url);

    const result = response.data.flatMap(org =>
      org.AuthorisationServers.flatMap(server =>
        server.ApiResources.filter(resource => {
          const apiFamilyTypeValid = resource.ApiFamilyType && (
            resource.ApiFamilyType.toLowerCase().includes('opendata') ||
            resource.ApiFamilyType.toLowerCase().includes('channels')
          );

          const orgNameValid = org.OrganisationName && org.OrganisationName.toLowerCase().includes('btg pactual');

          return apiFamilyTypeValid && orgNameValid;
        }).map(resource => ({
          ApiResourceId: resource.ApiResourceId 
        }))
      )
    );

    return result;  
  } catch (error) {
    throw new Error(`Error fetching API data: ${error.message}`);
  }
};

app.get('/api-data', async (req, res) => {
  try {
    const data = await fetchApiData();  
    res.status(200).json(data);         
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "API is running" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
