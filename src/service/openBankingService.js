// const axios = require('axios');

// const fetchApiData = async () => {
//   try {
//     const url = 'https://data.directory.openbankingbrasil.org.br/participants';
//     const response = await axios.get(url);

//     const result = response.data.flatMap(org =>
//       org.AuthorisationServers.flatMap(server =>
//         server.ApiResources.map(resource => ({
//           ApiFamilyType: resource.ApiFamilyType,
//           ApiDiscoveryId: resource.ApiDiscoveryEndpoints[0]?.ApiDiscoveryId,
//           ApiEndpoint: resource.ApiDiscoveryEndpoints[0]?.ApiEndpoint,
//         }))
//       )
//     );

//     return result;
//   } catch (error) {
//     throw new Error(`Error fetching API data: ${error.message}`);
//   }
// };

// module.exports = { fetchApiData };


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

module.exports = { fetchApiData };
