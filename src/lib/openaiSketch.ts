// OpenAI Sketch Image Generation Utility

export async function callOpenAIGptImage({
  base64Image,
  promptText
}: {
  base64Image: string,
  promptText: string
}) {
  // Get API key from localStorage (manually entered by user)
  const apiKey = localStorage.getItem('OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error("OpenAI API key not found. Please enter your API key in the sidebar.");
  }

  const response = await fetch("/api/sketch-ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ base64Image, promptText, apiKey })
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