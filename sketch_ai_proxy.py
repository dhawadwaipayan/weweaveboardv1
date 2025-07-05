from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os

app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "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")

class SketchAIRequest(BaseModel):
    base64Image: str
    promptText: str

@app.post("/api/sketch-ai")
async def sketch_ai(request: SketchAIRequest):
    client = OpenAI(api_key=OPENAI_API_KEY)
    try:
        response = client.responses.create(
            model="gpt-4.1",
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": request.promptText},
                        {"type": "input_image", "image_url": request.base64Image}
                    ]
                }
            ],
            text={"format": {"type": "text"}},
            reasoning={},
            tools=[
                {
                    "type": "image_generation",
                    "size": "1024x1024",
                    "quality": "high",
                    "output_format": "png",
                    "background": "transparent",
                    "moderation": "low"
                }
            ],
            temperature=1,
            max_output_tokens=2048,
            top_p=1,
            store=True
        )
        return response
    except Exception as e:
        return {"error": str(e)} 