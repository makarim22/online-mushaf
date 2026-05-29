export const handler = async (event, context) => {
  try {
    const apiKey = process.env.VITE_SUNNAH_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Server misconfiguration: Missing API Key" })
      };
    }

    const response = await fetch("https://api.sunnah.com/v1/hadiths/random", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-API-Key": apiKey
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Sunnah API error: ${response.statusText}` })
      };
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Netlify Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch hadith" })
    };
  }
};
