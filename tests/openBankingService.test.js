const axios = require("axios");
const { fetchApiData } = require("../src/service/openBankingService");

jest.mock("axios");

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

    axios.get.mockResolvedValueOnce({ data: mockData });

    const result = await fetchApiData();

    expect(result).toEqual([
      {
        ApiFamilyType: "discovery_outages",
        ApiDiscoveryId: "12345",
        ApiEndpoint: "https://example.com",
      },
    ]);
  });

  it("should throw an error if API call fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    await expect(fetchApiData()).rejects.toThrow(
      "Error fetching API data: Network Error"
    );
  });
});
