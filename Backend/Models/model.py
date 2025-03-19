from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import os
import google.generativeai as genai
from dotenv import load_dotenv
import io
import json
import re

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store last uploaded image data in memory
last_image_data = {"detected_objects": [], "caption": ""}

def load_models():
    yolo = YOLO("yolov8n.pt")
    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
    blip = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")
    return yolo, processor, blip

yolo_model, processor, blip_model = load_models()

def configure_genai():
    api_key = os.getenv("GEMINI_KEY")
    print(api_key)
    if not api_key:
        raise ValueError("API Key is missing! Check your .env file.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.0-flash")

genai_model = configure_genai()

def detect_objects(image):
    """Detect objects in an image using YOLO model."""
    try:
        image_array = cv2.imdecode(image, cv2.IMREAD_COLOR)
        results = yolo_model(image_array)
        return [yolo_model.names[int(box.cls)] for result in results for box in result.boxes]
    except Exception:
        return []
def generate_caption(image):
    """Generate an image caption using BLIP model."""
    try:
        img = Image.open(io.BytesIO(image)).convert("RGB")
        inputs = processor(images=img, return_tensors="pt")
        caption_ids = blip_model.generate(**inputs)
        return processor.batch_decode(caption_ids, skip_special_tokens=True)[0]
    except Exception:
        return "Caption could not be generated."

@app.post("/chatbot/")
async def chatbot(
    user_query: str = Form(...), 
    image: UploadFile = File(None),
    chat_history: str = Form("[]") 
):
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
        prompt = (f"You are a helpful chatbot. Consider the full conversation history before answering:\n\n"
                  f"{chat_context}\n\n"
                  f"Caption: {caption if caption else 'None'}\n"
                  f"Detected Objects: {', '.join(detected_objects) if detected_objects else 'None'}\n"
                  f"User Query: {user_query}\n"
                  "Response:")

        response = genai_model.generate_content(prompt).text
        return {"response": response, "detected_objects": detected_objects, "caption": caption}

    except Exception as e:
        return {"error": str(e)}

import re

@app.post("/chatbot/generate_title/")
async def generate_title(user_query: str = Form(...)):
    try:
        prompt = f"Generate a short and engaging chat title in exactly three words based on this query: {user_query}. Only return the title, nothing else."
        title = genai_model.generate_content(prompt).text  

        # Remove any unwanted symbols like **, quotes, or punctuation
        clean_title = re.sub(r"[^\w\s]", "", title).strip()

        return {"chat_title": " ".join(clean_title.split()[:3])}  # Ensures only three words
    except Exception as e:
        return {"error": str(e)}