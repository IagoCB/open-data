const handleYamlService = require("./handleYamlService.js");
const fetch = require("node-fetch");
const path = require("path");
const { loadYamlPattern, validateApiResponse } = handleYamlService;

async function getBankingData() {
  const url = "https://data.directory.openbankingbrasil.org.br/participants";

  try {
    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error("Falha na requisição à API");
    }

    const dados = await resposta.json();
    const dadosFiltrados = filtrarDados(dados);
    const payloads = extrairPayloads(dadosFiltrados);

    const validationResults = [];
    for (const endpoint of payloads) {
      const validation = await validarEndpoint(endpoint);
      if (validation)
        validationResults.push({
          endPoint: endpoint.ApiEndpoint,
          ...validation,
        });
    }

    return validationResults;
  } catch (erro) {
    console.error("Erro ao chamar a API:", erro);
    throw erro;
  }
}

function filtrarDados(dados) {
  return dados.filter((item) => {
    if (item.RegisteredName?.toUpperCase() === "BANCO BTG PACTUAL S.A.") {
      return item.AuthorisationServers?.some((server) => {
        return server.ApiResources?.some((api) => verificarApi(api));
      });
    }
    return false;
  });
}

function verificarApi(api) {
  return (
    api.ApiFamilyType &&
    (api.ApiFamilyType.toLowerCase().includes("opendata") ||
      api.ApiFamilyType.toLowerCase().includes("channels"))
  );
}

function extrairPayloads(dadosFiltrados) {
  return dadosFiltrados.flatMap((item) =>
    item.AuthorisationServers.flatMap((server) =>
      server.ApiResources.filter((api) => verificarApi(api)).flatMap(
        (api) => api.ApiDiscoveryEndpoints || []
      )
    )
  );
}

async function validarEndpoint(endpoint) {
  try {
    const resposta = await fetch(endpoint.ApiEndpoint);
    if (!resposta.ok) {
      throw new Error(
        `Falha na requisição ao endpoint: ${endpoint.ApiEndpoint}`
      );
    }
    const apiResponse = await resposta.json();
    const yaml = getYamlFile(endpoint.ApiEndpoint);

    const yamlPath = path.resolve(__dirname, "../schemas/" + yaml);

    const yamlPattern = await loadYamlPattern(yamlPath);

    const validationResult = validateApiResponse(
      yamlPattern,
      apiResponse.data,
      endpoint.ApiEndpoint
    );

    if (validationResult === null) {
    }
    return validationResult;
  } catch (erro) {
    // console.error(`Erro ao validar o endpoint ${endpoint.ApiEndpoint}:`, erro);
  }

  function getYamlFile(endpoint) {
    const regex = /\/open-banking\/([\w-]+)\/v\d+/;

    const match = endpoint.match(regex);

    if (match && match[1]) {
      return `${match[1]}.yml`;
    } else {
      return "Arquivo YAML não encontrado";
    }
  }
}

module.exports = {
  getBankingData,
  filtrarDados,
  extrairPayloads,
  validarEndpoint,
};
