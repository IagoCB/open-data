const yaml = require("js-yaml");
const fs = require("fs");
const $RefParser = require("json-schema-ref-parser");

/**
 * Função que carrega e resolve referências de um arquivo YAML.
 *
 * @param {string} yamlPath - Caminho do arquivo YAML a ser carregado.
 * @returns {Promise<object>} - Retorna uma Promise que resolve para o YAML carregado e resolvido, com referências externas substituídas.
 */
async function loadYamlPattern(yamlPath) {
  const yamlContent = fs.readFileSync(yamlPath, "utf8");
  const yamlParsed = yaml.load(yamlContent);

  return await $RefParser.dereference(yamlParsed);
}

/**
 * Função que valida a resposta da API com base no esquema fornecido pelo YAML.
 *
 * @param {object} yamlPattern - O padrão do YAML que define o esquema da resposta da API, contendo a definição de resposta em formato JSON.
 * @param {Array} apiResponse - A resposta da API a ser validada contra o esquema do YAML.
 * @returns {object} - Retorna um objeto contendo:
 *   - `isValid` (boolean): Se a resposta está de acordo com o esquema.
 *   - `errors` (array): Lista de mensagens de erro caso a resposta não esteja conforme o esperado.
 */
function validateApiResponse(yamlPattern, apiResponse, apiEndpoint) {
  const finalSegment = apiEndpoint.split("/").pop();
  const responseSchema =
    yamlPattern?.paths["/" + finalSegment].get.responses["200"].content[
      "application/json"
    ].schema.properties.data.items;

  const errors = [];
  /**
   * Função que valida um campo específico de acordo com o seu tipo, enum, padrão, comprimento, etc.
   *
   * @param {string} field - Nome do campo que está sendo validado.
   * @param {any} fieldValue - Valor do campo a ser validado.
   * @param {object} fieldSchema - Esquema do campo contendo regras de validação como tipo, enum, etc.
   */
  const validateField = (field, fieldValue, fieldSchema) => {
    if (fieldSchema.type) {
      const actualType = Array.isArray(fieldValue)
        ? "array"
        : typeof fieldValue;
      if (actualType !== fieldSchema.type) {
        errors.push(
          `O campo '${field}' deve ser do tipo ${fieldSchema.type}, mas foi recebido: ${actualType}.`
        );
      }
    }

    if (fieldSchema.enum && !fieldSchema.enum.includes(fieldValue)) {
      errors.push(
        `O campo '${field}' deve ser um dos seguintes valores: ${fieldSchema.enum.join(
          ", "
        )}.`
      );
    }

    if (
      fieldSchema.pattern &&
      !new RegExp(fieldSchema.pattern).test(fieldValue)
    ) {
      errors.push(
        `O campo '${field}' não corresponde ao padrão esperado: ${fieldSchema.pattern}.`
      );
    }

    if (fieldSchema.minLength && fieldValue.length < fieldSchema.minLength) {
      errors.push(
        `O campo '${field}' deve ter pelo menos ${fieldSchema.minLength} caracteres.`
      );
    }
    if (fieldSchema.maxLength && fieldValue.length > fieldSchema.maxLength) {
      errors.push(
        `O campo '${field}' não deve ter mais que ${fieldSchema.maxLength} caracteres.`
      );
    }
  };

  /**
   * Função que valida um objeto (que pode conter campos aninhados).
   *
   * @param {string} parentField - Nome do campo pai, usado para construir a chave completa do campo.
   * @param {object} parentValue - Valor do objeto pai a ser validado.
   * @param {object} objectSchema - Esquema do objeto com a definição dos campos internos.
   */
  const validateObject = (parentField, parentValue, objectSchema) => {
    objectSchema.required.forEach((key) => {
      const field = `${parentField}.${key}`;
      const fieldValue = parentValue[key];
      const fieldSchema = objectSchema.properties[key];

      if (!(key in parentValue)) {
        errors.push(`O campo obrigatório '${field}' está ausente.`);
      }

      if (fieldValue) {
        if (fieldSchema.type === "object") {
          validateObject(field, fieldValue, fieldSchema);
        } else {
          validateField(field, fieldValue, fieldSchema);
        }
      }
    });
  };

  apiResponse.forEach((item, index) => {
    const itemErrors = [];
    const requiredFields = responseSchema?.required;

    requiredFields.forEach((field) => {
      const fieldValue = item[field];
      const fieldSchema = responseSchema.properties[field];

      if (!(field in item)) {
        itemErrors.push(
          `O campo obrigatório '${field}' está ausente no objeto de índice ${index}.`
        );
      } else {
        if (fieldSchema.type === "object") {
          validateObject(`${index}`, fieldValue, fieldSchema);
        } else {
          validateField(`${index}.${field}`, fieldValue, fieldSchema);
        }
      }
    });

    errors.push(...itemErrors);
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = { validateApiResponse, loadYamlPattern };
