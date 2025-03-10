from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import os
import google.generativeai as genai
from dotenv import load_dotenv
import base64
import io

app = Flask(__name__)
load_dotenv()

# Load AI models
yolo_model = YOLO("yolov8n.pt")
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")

# Gemini AI Setup
api_key = os.getenv("GEMINI_KEY")
if not api_key:
    raise ValueError("API Key is missing! Check your .env file.")
genai.configure(api_key=api_key)
gemini_model = genai.GenerativeModel("gemini-pro")


def detect_objects(image):
    """Detect objects in an image using YOLO."""
    results = yolo_model(image)
    detected_objects = [yolo_model.names[int(box.cls)] for result in results for box in result.boxes]
    return detected_objects


def generate_caption(image):
    """Generate a caption for an image using BLIP."""
    inputs = processor(images=image, return_tensors="pt")
    caption_ids = blip_model.generate(**inputs)
    caption = processor.batch_decode(caption_ids, skip_special_tokens=True)[0]
    return caption


def get_chatbot_response(user_query, caption=None, detected_objects=None):
    """Generate a response using Gemini AI."""
    prompt = f"You are a helpful chatbot. Respond to the user's query.\n\n"

    if caption and detected_objects:
        prompt += f"Image Caption: {caption}\nDetected Objects: {detected_objects}\n\n"
        prompt += "User Query: " + user_query + "\n\nResponse:"
    else:
        prompt += "User Query: " + user_query + "\n\nResponse:"

    response = gemini_model.generate_content(prompt)
    return response.text.strip()


@app.route("/chat", methods=["POST"])
def chat(): 
    print(os.getenv("GEMINI_KEY"))
    print("Hi")
    """Handle user chat requests (with or without an image)."""
    try:
        data = request.json
        user_query = data.get("query", "")
        image_data = data.get("image", None)

        if image_data:
            # Convert base64 to Image
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

            # Process image
            detected_objects = detect_objects(cv2.cvtColor(cv2.imread(io.BytesIO(image_bytes)), cv2.COLOR_RGB2BGR))
            caption = generate_caption(image)

            # Get chatbot response based on image
            response_text = get_chatbot_response(user_query, caption, detected_objects)
        else:
            # No image, get chatbot response normally
            response_text = get_chatbot_response(user_query)
        print(response_text)
        return jsonify({"response": response_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
