from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import os
import google.generativeai as genai
from dotenv import load_dotenv
import io
import json
import re

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load lightweight models globally to reduce memory usage
yolo_model = YOLO("yolov8n.pt")  # Smaller version of YOLO
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")  # Smaller BLIP model
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

# Configure Google Gemini AI
def configure_genai():
    api_key = os.getenv("GEMINI_KEY")
    if not api_key:
        raise ValueError("API Key is missing! Check your .env file.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")

genai_model = configure_genai()

# Store last uploaded image data
last_image_data = {"detected_objects": [], "caption": ""}

def detect_objects(image_bytes):
    """Detect objects in an image using YOLO model."""
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        results = yolo_model(image)
        detected_objects = [yolo_model.names[int(box.cls)] for result in results for box in result.boxes]
        return detected_objects
    except Exception:
        return []

def generate_caption(image_bytes):
    """Generate an image caption using BLIP model."""
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        inputs = processor(images=image, return_tensors="pt")
        caption_ids = blip_model.generate(**inputs)
        return processor.batch_decode(caption_ids, skip_special_tokens=True)[0]
    except Exception:
        return "Caption could not be generated."

@app.post("/chatbot/")
async def chatbot(user_query: str = Form(...), image: UploadFile = File(None), chat_history: str = Form("[]")):
    global last_image_data
    try:
        chat_history = json.loads(chat_history)

        if image:
            image_bytes = await image.read()
            detected_objects = detect_objects(image_bytes)
            caption = generate_caption(image_bytes)
            last_image_data = {"detected_objects": detected_objects, "caption": caption}
        else:
            detected_objects = last_image_data["detected_objects"]
            caption = last_image_data["caption"]

        chat_context = "\n".join([f"{msg['sender']}: {msg['text']}" for msg in chat_history])
        prompt = (f"Given the conversation history:\n{chat_context}\n\n"
                  f"Caption: {caption if caption else 'None'}\n"
                  f"Detected Objects: {', '.join(detected_objects) if detected_objects else 'None'}\n"
                  f"User Query: {user_query}\n"
                  "Response:")

        response = genai_model.generate_content(prompt).text
        return {"response": response, "detected_objects": detected_objects, "caption": caption}

    except Exception as e:
        return {"error": str(e)}

@app.post("/chatbot/generate_title/")
async def generate_title(user_query: str = Form(...)):
    try:
        prompt = f"Generate a short, three-word chat title based on: {user_query}."
        title = genai_model.generate_content(prompt).text  
        clean_title = re.sub(r"[^\w\s]", "", title).strip()
        return {"chat_title": " ".join(clean_title.split()[:3])}
    except Exception as e:
        return {"error": str(e)}
