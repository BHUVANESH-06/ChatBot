from ultralytics import YOLO
import cv2
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import os
import google.generativeai as genai
from dotenv import load_dotenv,find_dotenv

# Load YOLOv8 Model
yolo_model = YOLO("yolov8n.pt")

# Load BLIP-2 Model
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")

def detect_objects(image_path):
    image = cv2.imread(image_path)
    results = yolo_model(image)
    
    detected_objects = [yolo_model.names[int(box.cls)] for result in results for box in result.boxes]
    return detected_objects

def generate_caption(image_path):
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    caption_ids = blip_model.generate(**inputs)
    caption = processor.batch_decode(caption_ids, skip_special_tokens=True)[0]
    return caption

# Run the complete pipeline
if __name__ == "__main__":
    load_dotenv("C:/1604/.env") 
    
    image_path = "C://1604//Backend//Models//test.jpg"

    detected_objects = detect_objects(image_path)
    print("Detected Objects:", detected_objects)

    caption = generate_caption(image_path)
    print("Generated Caption:", caption)
    
    api_key = os.getenv("GEMINI_KEY")
    
    if not api_key:
        raise ValueError("API Key is missing! Check your .env file.")
    
    user_query = input("Enter the query about the image")
    
    prompt = f"""
            You are a helpful image recognition chatbot. Based on the detected objects in the image and the caption, respond to the user's query.

            Caption: {caption}
            Detected Objects: {detected_objects}

            User Query: {user_query}

            Response:
            """
    genai.configure(api_key=api_key)
    
    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content(prompt)
    
    print(response.text)
    
