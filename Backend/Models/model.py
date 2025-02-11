from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image

# Load BLIP-2 Model
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")

def generate_caption(image_path):
    image = Image.open(image_path).convert("RGB")

    # Prepare input for BLIP-2
    inputs = processor(images=image, return_tensors="pt")

    # Generate Caption
    caption_ids = model.generate(**inputs)
    caption = processor.batch_decode(caption_ids, skip_special_tokens=True)[0]

    return caption

# Test Caption Generation
if __name__ == "__main__":
    image_path = "C://1604//Backend//Models//test.jpg"  # Replace with your image path
    caption = generate_caption(image_path)
    print("Generated Caption:", caption)
