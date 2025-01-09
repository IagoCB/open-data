import express from 'express';
import { getBankingData } from '../service/openBankingService.js';

const router = express.Router();

router.get('/banking-data', async (req, res) => {
  try {
    const dados = await getBankingData();
    res.json(dados);
  } catch (erro) {
    console.error('Erro ao obter dados:', erro);
    res.status(500).json({ error: 'Erro ao obter dados bancários' });
  }
});

export default router;
