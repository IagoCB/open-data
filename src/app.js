import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import routes from "./routes/index.js";

const swaggerDocument = JSON.parse(
  fs.readFileSync(new URL("./docs/swagger.json", import.meta.url))
);

const app = express();

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(express.json());

app.use("/api", routes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
