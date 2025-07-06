// OpenAI Sketch Image Generation Utility

export async function callOpenAIGptImage({
  base64Sketch,
  base64Material,
  promptText
}: {
  base64Sketch: string,
  base64Material?: string,
  promptText: string
}) {
  console.log('[callOpenAIGptImage] Preparing to call /api/sketch-ai', {
    base64SketchDefined: typeof base64Sketch !== 'undefined',
    base64SketchLength: base64Sketch ? base64Sketch.length : 0,
    base64MaterialDefined: typeof base64Material !== 'undefined',
    base64MaterialLength: base64Material ? base64Material.length : 0,
    promptText
  });
  if (!base64Sketch) {
    throw new Error('No bounding box image (base64Sketch) provided to OpenAI.');
  }
  let response;
  try {
    response = await fetch("/api/sketch-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ base64Sketch, base64Material, promptText })
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