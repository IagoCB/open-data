const handleYamlService = require('./handleYamlService.js');
const fetch = require('node-fetch');

const { loadYamlPattern, validateApiResponse } = handleYamlService;

async function getBankingData() {
  const url = 'https://data.directory.openbankingbrasil.org.br/participants';

  try {
    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error('Falha na requisição à API');
    }

    const dados = await resposta.json();
    const dadosFiltrados = filtrarDados(dados);
    const payloads = extrairPayloads(dadosFiltrados);

    // Processar cada endpoint
    for (const endpoint of payloads) {
      await validarEndpoint(endpoint);
    }

    return payloads;
  } catch (erro) {
    console.error('Erro ao chamar a API:', erro);
    throw erro;
  }
}

function filtrarDados(dados) {
  return dados.filter(item => {
    if (item.RegisteredName?.toUpperCase() === 'BANCO BTG PACTUAL S.A.') {
      return item.AuthorisationServers?.some(server => {
        return server.ApiResources?.some(api => verificarApi(api));
      });
    }
    return false;
  });
}

function verificarApi(api) {
  return api.ApiFamilyType && 
    (api.ApiFamilyType.toLowerCase().includes('opendata') || api.ApiFamilyType.toLowerCase().includes('channels'));
}

function extrairPayloads(dadosFiltrados) {
  return dadosFiltrados.flatMap(item => 
    item.AuthorisationServers.flatMap(server => 
      server.ApiResources.filter(api => verificarApi(api))
        .flatMap(api => api.ApiDiscoveryEndpoints || [])
    )
  );
}

// Função para validar cada endpoint
async function validarEndpoint(endpoint) {
  try {
    const resposta = await fetch(endpoint.ApiEndpoint);
    if (!resposta.ok) {
      throw new Error(`Falha na requisição ao endpoint: ${endpoint.ApiEndpoint}`);
    }

    const apiResponse = await resposta.json();
    console.log(`Dados obtidos do endpoint ${endpoint.ApiEndpoint}:`, apiResponse);

    const yamlPattern = await loadYamlPattern('path/to/yaml/file.yaml');

    // Validar a resposta da API
    const validationResult = validateApiResponse(yamlPattern, apiResponse);

    if (validationResult.isValid) {
      console.log(`A resposta do endpoint ${endpoint.ApiEndpoint} é válida.`);
    } else {
      console.error(`Erros de validação para o endpoint ${endpoint.ApiEndpoint}:`, validationResult.errors);
    }

    // Exibe resultado completo da validação para depuração
    console.log(`Resultado da validação do endpoint ${endpoint.ApiEndpoint}:`, validationResult);
  } catch (erro) {
    console.error(`Erro ao validar o endpoint ${endpoint.ApiEndpoint}:`, erro);
  }
}

module.exports = { getBankingData, filtrarDados, extrairPayloads, validarEndpoint };