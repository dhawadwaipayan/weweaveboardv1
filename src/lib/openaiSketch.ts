// OpenAI Sketch Image Generation Utility

export async function callOpenAIGptImage({
  base64Image,
  promptText
}: {
  base64Image: string,
  promptText: string
}) {
  console.log('[callOpenAIGptImage] Preparing to call /api/sketch-ai', { base64ImageLength: base64Image.length, promptText });
  let response;
  try {
    response = await fetch("/api/sketch-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ base64Image, promptText })
    });
  } catch (fetchErr) {
    console.error('[callOpenAIGptImage] Fetch failed:', fetchErr);
    throw new Error('Network error: ' + fetchErr);
  }
  console.log('[callOpenAIGptImage] Response status:', response.status, response.statusText);
  if (!response.ok) {
    let errorMsg = "";
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error || JSON.stringify(errorData);
    } catch (e) {
      errorMsg = response.statusText;
    }
    console.error('[callOpenAIGptImage] API error:', errorMsg);
    throw new Error("OpenAI API error: " + errorMsg);
  }
  const result = await response.json();
  console.log('[callOpenAIGptImage] Success response:', result);
  return result;
} 