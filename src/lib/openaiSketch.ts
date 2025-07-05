// OpenAI Sketch Image Generation Utility

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