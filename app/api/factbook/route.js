export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const continent = searchParams.get('continent');
  const country = searchParams.get('country');

  if (!continent || !country) {
    return new Response(JSON.stringify({ error: 'Missing continent or country parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = `https://raw.githubusercontent.com/factbook/factbook.json/refs/heads/master/${continent}/${country}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 