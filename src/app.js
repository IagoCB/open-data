const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/swagger.json");
const routes = require("./routes");

const app = express();

// Middleware
app.use(express.json());

// Rotas
app.use("/api", routes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
