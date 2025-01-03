const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/swagger.json");
const routes = require("./routes");
const express = require('express');
const openBankingRoutes = require('./routes/openBankingRoutes');

const app = express();

app.use('/open-banking', openBankingRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Middleware
app.use(express.json());

// Rotas
app.use("/api", routes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
