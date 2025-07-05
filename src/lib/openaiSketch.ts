// OpenAI Sketch Image Generation Utility

const apiKey = "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";

export async function callOpenAIGptImage({
  base64Image,
  promptText,
  imageCallId = "ig_" + Math.random().toString(36).slice(2),
  assistantMsgId = "msg_" + Math.random().toString(36).slice(2)
}: {
  base64Image: string,
  promptText: string,
  imageCallId?: string,
  assistantMsgId?: string
}) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: promptText
            },
            {
              type: "input_image",
              image_url: base64Image
            }
          ]
        },
        {
          type: "image_generation_call",
          id: imageCallId
        },
        {
          id: assistantMsgId,
          role: "assistant",
          content: [
            {
              type: "output_text",
              text: "Here is the updated flat sketch per your instructions: ..."
            }
          ]
        }
      ],
      text: {
        format: {
          type: "text"
        }
      },
      reasoning: {},
      tools: [
        {
          type: "image_generation",
          size: "1024x1024",
          quality: "high",
          output_format: "png",
          background: "transparent",
          moderation: "low",
          partial_images: 1
        }
      ],
      temperature: 1,
      max_output_tokens: 2048,
      top_p: 1,
      store: true
    })
  });

  if (!response.ok) throw new Error("OpenAI API error: " + response.statusText);
  return await response.json();
} 