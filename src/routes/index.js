import { getBankingData } from '../service/openBankingService.js';  

async function fetchBankingData() {
  try {
    const dados = await getBankingData(); 
    
    console.log('Dados filtrados:', dados);  
  } catch (erro) {
    console.error('Erro ao obter dados:', erro);
  }
}

fetchBankingData();
