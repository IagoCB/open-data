const path = require("path");
const {
  validateApiResponse,
  loadYamlPattern,
} = require("../src/service/handleYamlService");

describe("Validação de API com YAML", () => {
  const yamlPath = path.resolve(
    __dirname,
    "../src/schemas/acquiring-services.yml"
  );
  let yamlPattern;

  beforeAll(async () => {
    yamlPattern = await loadYamlPattern(yamlPath);
  });

  test("Deve validar corretamente uma resposta de API válida", () => {
    const validApiResponse = {
      participant: {
        brand: "Organização",
        name: "Organização A1",
        cnpjNumber: "13456789000112",
        urlComplementaryList: "https://empresaa1.com/companies",
      },
      feeName: "TAXA_DESCONTO_MODALIDADE_CREDITO",
      code: "MDR_CREDITO",
      prices: [
        {
          interval: "1_FAIXA",
          value: "0.020300",
          customerRate: "0.500000",
        },
        {
          interval: "2_FAIXA",
          value: "0.030600",
          customerRate: "0.100000",
        },
        {
          interval: "3_FAIXA",
          value: "0.034300",
          customerRate: "0.300000",
        },
        {
          interval: "4_FAIXA",
          value: "0.246800",
          customerRate: "0.100000",
        },
      ],
      chargingTriggerInfo: "Recebimento através de transação de cartão.",
      minimum: "0.019800",
      maximum: "0.019800",
    };

    const validationResult = validateApiResponse(yamlPattern, validApiResponse);

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toEqual([]);
  });

  test("Deve retornar erro se campos obrigatórios estiverem ausentes", () => {
    const invalidApiResponse = {
      links: { self: "https://api.example.com/services" },
      meta: { total: 2 },
    };

    const validationResult = validateApiResponse(
      yamlPattern,
      invalidApiResponse
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain(
      "O campo obrigatório 'participant' está ausente.",
      "O campo obrigatório 'feeName' está ausente.",
      "O campo obrigatório 'code' está ausente.",
      "O campo obrigatório 'prices' está ausente.",
      "O campo obrigatório 'chargingTriggerInfo' está ausente.",
      "O campo obrigatório 'minimum' está ausente.",
      "O campo obrigatório 'maximum' está ausente."
    );
  });

  test("Deve validar a resposta de API com tipo de dado incorreto em campo obrigatório", () => {
    const invalidApiResponse = {
      participant: { id: 12345, name: 12345 },
      feeName: "INVALID_FEE_NAME",
      code: "MDR_CREDITO",
      prices: [
        { priceType: "percentual", value: "0.019800" },
        { priceType: "fixo", value: "10.00" },
        { priceType: "percentual", value: "0.010000" },
        { priceType: "fixo", value: "5.00" },
      ],
      chargingTriggerInfo: "",
      minimum: "0.019800",
      maximum: "0.019800",
    };

    const validationResult = validateApiResponse(
      yamlPattern,
      invalidApiResponse
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain(
      "O campo 'participant.name' deve ser do tipo string, mas foi recebido: number."
    );
  });

  test("Deve validar a resposta de API quando um valor de enum é incorreto", () => {
    const invalidApiResponse = {
      participant: {
        id: "12345",
        name: "Open Finance Participant",
        type: "Pessoa Jurídica",
        registrationNumber: "12345678000123",
        country: "Brasil",
      },
      feeName: "INVALID_FEE_NAME",
      code: "MDR_CREDITO",
      prices: [
        { priceType: "percentual", value: "0.019800" },
        { priceType: "fixo", value: "10.00" },
        { priceType: "percentual", value: "0.010000" },
        { priceType: "fixo", value: "5.00" },
      ],
      chargingTriggerInfo: "Recebimento através de transação de cartão.",
      minimum: "0.019800",
      maximum: "0.019800",
    };

    const validationResult = validateApiResponse(
      yamlPattern,
      invalidApiResponse
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain(
      "O campo 'feeName' deve ser um dos seguintes valores: TAXA_DESCONTO_MODALIDADE_CREDITO, TAXA_DESCONTO_MODALIDADE_DEBITO."
    );
  });

  test("Deve retornar erro se um campo de string estiver com comprimento incorreto", () => {
    const invalidApiResponse = {
      participant: {
        id: "12345",
        name: "Open Finance Participant",
        type: "Pessoa Jurídica",
        registrationNumber: "12345678000123",
        country: "Brasil",
      },
      feeName: "TAXA_DESCONTO_MODALIDADE_CREDITO",
      code: "MDR_CREDITO",
      prices: [
        { priceType: "percentual", value: "0.019800" },
        { priceType: "fixo", value: "10.00" },
        { priceType: "percentual", value: "0.010000" },
        { priceType: "fixo", value: "5.00" },
      ],
      chargingTriggerInfo: "",
      minimum: "0.019800",
      maximum: "0.019800",
    };

    const validationResult = validateApiResponse(
      yamlPattern,
      invalidApiResponse
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain(
      "O campo 'chargingTriggerInfo' deve ter pelo menos 1 caracteres."
    );
  });

  test("Deve validar a resposta de API com um campo ausente de um objeto", () => {
    const invalidApiResponse = {
      participant: {
        id: "12345",
        name: "Open Finance Participant",
        type: "Pessoa Jurídica",
        registrationNumber: "12345678000123",
      },
      feeName: "TAXA_DESCONTO_MODALIDADE_CREDITO",
      code: "MDR_CREDITO",
      prices: [
        { priceType: "percentual", value: "0.019800" },
        { priceType: "fixo", value: "10.00" },
        { priceType: "percentual", value: "0.010000" },
        { priceType: "fixo", value: "5.00" },
      ],
      chargingTriggerInfo: "Recebimento através de transação de cartão.",
      minimum: "0.019800",
      maximum: "0.019800",
    };

    const validationResult = validateApiResponse(
      yamlPattern,
      invalidApiResponse
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain(
      "O campo obrigatório 'participant.brand' está ausente.",
      "O campo obrigatório 'participant.cnpjNumber' está ausente.",
      "O campo obrigatório 'participant.urlComplementaryList' está ausente."
    );
  });
});
