const fetch = require("node-fetch");
const {
  getBankingData,
  filtrarDados,
  extrairPayloads,
  validarEndpoint,
} = require("../src/service/openBankingService");

jest.mock("node-fetch");

describe("OpenBanking Service", () => {
  it("should fetch and transform API data correctly", async () => {
    const mockData = [
      {
        AuthorisationServers: [
          {
            ApiResources: [
              {
                ApiFamilyType: "discovery_outages",
                ApiDiscoveryEndpoints: [
                  {
                    ApiDiscoveryId: "12345",
                    ApiEndpoint: "https://example.com",
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await getBankingData();

    expect(result).toEqual([
      {
        ApiFamilyType: "discovery_outages",
        ApiDiscoveryId: "12345",
        ApiEndpoint: "https://example.com",
      },
    ]);
  });

  it("should throw an error if API call fails", async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    await expect(getBankingData()).rejects.toThrow("Falha na requisição à API");
  });

  it("should filter data correctly with filtrarDados", () => {
    const mockData = [
      {
        RegisteredName: "BANCO BTG PACTUAL S.A.",
        AuthorisationServers: [
          {
            ApiResources: [
              {
                ApiFamilyType: "opendata",
                ApiDiscoveryEndpoints: [
                  {
                    ApiDiscoveryId: "12345",
                    ApiEndpoint: "https://example.com",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        RegisteredName: "Outro Banco",
        AuthorisationServers: [],
      },
    ];

    const filteredData = filtrarDados(mockData);

    expect(filteredData).toEqual([
      {
        RegisteredName: "BANCO BTG PACTUAL S.A.",
        AuthorisationServers: [
          {
            ApiResources: [
              {
                ApiFamilyType: "opendata",
                ApiDiscoveryEndpoints: [
                  {
                    ApiDiscoveryId: "12345",
                    ApiEndpoint: "https://example.com",
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("should extract payloads correctly with extrairPayloads", () => {
    const mockData = [
      {
        AuthorisationServers: [
          {
            ApiResources: [
              {
                ApiFamilyType: "opendata",
                ApiDiscoveryEndpoints: [
                  {
                    ApiDiscoveryId: "12345",
                    ApiEndpoint: "https://example.com",
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const extractedPayloads = extrairPayloads(mockData);

    expect(extractedPayloads).toEqual([
      {
        ApiDiscoveryId: "12345",
        ApiEndpoint: "https://example.com",
      },
    ]);
  });

  it("should validate API endpoint correctly with validarEndpoint", async () => {
    const mockResponse = { status: 200, json: async () => ({ success: true }) };
    const mockYamlPattern = {};
    const mockValidationResult = { isValid: true, errors: [] };

    // Mock das funções externas
    jest.mock("../src/service/handleYamlService", () => ({
      loadYamlPattern: jest.fn().mockResolvedValue(mockYamlPattern),
      validateApiResponse: jest.fn().mockReturnValue(mockValidationResult),
    }));

    fetch.mockResolvedValueOnce(mockResponse);

    const endpoint = { ApiEndpoint: "https://example.com" };

    await validarEndpoint(endpoint);

    expect(fetch).toHaveBeenCalledWith(endpoint.ApiEndpoint);
    expect(loadYamlPattern).toHaveBeenCalledWith("path/to/yaml/file.yaml");
    expect(validateApiResponse).toHaveBeenCalledWith(
      mockYamlPattern,
      mockResponse.json()
    );
  });

  it("should throw error if endpoint validation fails", async () => {
    const mockResponse = {
      status: 200,
      json: async () => ({ success: false }),
    };
    const mockYamlPattern = {};
    const mockValidationResult = {
      isValid: false,
      errors: ["Erro de validação"],
    };

    // Mock das funções externas
    jest.mock("../src/service/handleYamlService", () => ({
      loadYamlPattern: jest.fn().mockResolvedValue(mockYamlPattern),
      validateApiResponse: jest.fn().mockReturnValue(mockValidationResult),
    }));

    fetch.mockResolvedValueOnce(mockResponse);

    const endpoint = { ApiEndpoint: "https://example.com" };

    await validarEndpoint(endpoint);

    expect(fetch).toHaveBeenCalledWith(endpoint.ApiEndpoint);
    expect(loadYamlPattern).toHaveBeenCalledWith("path/to/yaml/file.yaml");
    expect(validateApiResponse).toHaveBeenCalledWith(
      mockYamlPattern,
      mockResponse.json()
    );

    // Testar se os erros de validação são logados
    console.error = jest.fn();
    expect(console.error).toHaveBeenCalledWith(
      "Erros de validação para o endpoint https://example.com:",
      ["Erro de validação"]
    );
  });
});
