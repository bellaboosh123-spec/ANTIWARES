export async function obfuscate(code) {
  const response = await fetch('http://78.154.103.2:9919/api/obfuscate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code,
      options: {
        scramble: true,
        skidProtection: true,  // Changed to true
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Obfuscation failed');
  }

  const data = await response.json();
  return data.output;
}