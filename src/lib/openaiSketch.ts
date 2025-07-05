// OpenAI Sketch Image Generation Utility

const apiKey = "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";

export async function callOpenAIGptImage({
  base64Image,
  promptText
}: {
  base64Image: string,
  promptText: string
}) {
  const response = await fetch("/api/sketch-ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ base64Image, promptText })
  });
  if (!response.ok) {
    let errorMsg = "";
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error || JSON.stringify(errorData);
    } catch (e) {
      errorMsg = response.statusText;
    }
    throw new Error("OpenAI API error: " + errorMsg);
  }
  return await response.json();
} 