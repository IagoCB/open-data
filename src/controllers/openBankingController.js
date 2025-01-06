const { fetchApiData } = require("../service/openBankingService");

const getApiData = async (req, res) => {
  try {
    const data = await fetchApiData();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getApiData };
