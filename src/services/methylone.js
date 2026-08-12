export async function obfuscate(code) {
  const response = await fetch('http://78.154.103.2:9919/api/obfuscate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code,
      options: {
        scramble: true,
        skidProtection: false,
        // paste: "rubis", // keep commented for now
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Obfuscation failed');
  }

  const data = await response.json();
  
  // LOG THE OUTPUT
  console.log('Methylone response:', data);
  console.log('Output length:', data.output ? data.output.length : 'null');
  console.log('Output preview:', data.output ? data.output.slice(0, 500) : 'null');

  return data.output;
}