const fetch = require("node-fetch");
const {
  getBankingData,
  filtrarDados,
  extrairPayloads,
  validarEndpoint,
} = require("../src/service/openBankingService");

jest.mock("../src/service/handleYamlService", () => ({
  loadYamlPattern: jest.fn().mockResolvedValue({}),
  validateApiResponse: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
}));

jest.mock("node-fetch");

describe("OpenBanking Service", () => {

  it("should fetch and transform API data correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          RegisteredName: "BANCO BTG PACTUAL S.A.",
          AuthorisationServers: [
            {
              ApiResources: [
                {
                  ApiFamilyType: "opendata",
                  ApiDiscoveryEndpoints: [
                    {
                      ApiDiscoveryId: "d559f9a5-e5c3-40fe-b7af-e26115bc9508",
                      ApiEndpoint: "https://example.com/api",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const result = await getBankingData();

    expect(result).toEqual([
      {
        ApiFamilyType: "opendata",
        ApiDiscoveryId: "d559f9a5-e5c3-40fe-b7af-e26115bc9508",
        ApiEndpoint: "https://example.com/api",
      },
    ]);
  });

  it("should throw an error if API call fails", async () => {
    fetch.mockResolvedValueOnce({ ok: false, statusText: "Not Found" });

    await expect(getBankingData()).rejects.toThrow("Falha na requisição à API");
  });

  it("should validate API endpoint correctly with validarEndpoint", async () => {
    const mockResponse = { ok: true, json: async () => ({ success: true }) };
    const endpoint = { ApiEndpoint: "https://example.com" };

    fetch.mockResolvedValueOnce(mockResponse);

    await validarEndpoint(endpoint);

    expect(fetch).toHaveBeenCalledWith(endpoint.ApiEndpoint);
    expect(loadYamlPattern).toHaveBeenCalledWith("path/to/yaml/file.yaml");
  });

  it("should throw error if endpoint validation fails", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ success: false }),
    };
    const endpoint = { ApiEndpoint: "https://example.com" };

    fetch.mockResolvedValueOnce(mockResponse);

    console.error = jest.fn();

    await validarEndpoint(endpoint);

    expect(console.error).toHaveBeenCalledWith(
      "Erros de validação para o endpoint https://example.com:",
      ["Erro de validação"]
    );
  });
});
