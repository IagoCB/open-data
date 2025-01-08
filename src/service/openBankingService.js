export async function getBankingData() {
  const url = 'https://data.directory.openbankingbrasil.org.br/participants';

  try {
    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error('Falha na requisição à API');
    }

    const dados = await resposta.json();
    const dadosFiltrados = filtrarDados(dados);

    const payloads = extrairPayloads(dadosFiltrados);

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
