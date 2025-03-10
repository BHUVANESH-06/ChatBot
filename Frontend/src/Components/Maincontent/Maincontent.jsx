import { useState, useEffect } from "react";
import "./Maincontent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faPaperPlane,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

const Maincontent = ({ chatId, isSidebarOpen }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setMessages([
      { text: "Hello! How can I assist you today?", sender: "bot" },
      { text: "What is the meaning of life?", sender: "user" },
      {
        text: "42! Just kidding. It depends on your perspective.",
        sender: "bot",
      },
    ]);
  }, []);
  const sendMessage = async () => {
    if (inputValue.trim() !== "" || selectedImage) {
      setMessages([...messages, { text: inputValue, sender: "user", image: selectedImage }]);
  
      let base64Image = null;
      if (selectedImage) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        base64Image = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result.split(",")[1]); // Extract Base64
        });
      }
  
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: inputValue, image: base64Image }),
      });
  
      const data = await res.json();
      if (data.response) {
        setMessages([...messages, { text: inputValue, sender: "user", image: selectedImage }, { text: data.response, sender: "bot" }]);
      }
  
      setInputValue("");
      setSelectedImage(null);
    }
  };
  

  const handleSendMessageViaButton = () => {
    sendMessage();
  };

  const handleSendMessage = (event) => {
    if (event.key === "Enter" && (inputValue.trim() !== "" || selectedImage)) {
      sendMessage();
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const imageURL = URL.createObjectURL(file);
      setSelectedImage(imageURL);
      event.target.value = "";
    } else {
      alert("Please select a valid image file.");
    }
  };

  const openFileManager = () => {
    document.getElementById("fileInput").click();
  };

  return (
    <div className={`chat-container ${isSidebarOpen ? "with-sidebar" : ""}`}>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender}`}>
            {msg.text && <p>{msg.text}</p>}
            {msg.image && (
              <img src={msg.image} alt="Uploaded" className="chat-image" />
            )}
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="image-preview">
          <img src={selectedImage} alt="Preview" className="preview-image" />
        </div>
      )}

      <div className="chat-input-container">
        <input
          className="chat-input"
          value={inputValue}
          placeholder="Ask anything..."
          onKeyDown={handleSendMessage}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <div className="buttons">
          <div className="left-buttons">
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
            <div
              className={`button-item-plus ${selectedImage ? "disabled" : ""}`}
              onClick={!selectedImage ? openFileManager : null} // Prevent click when disabled
            >
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <div className="button-item">
              <p>search</p>
              <FontAwesomeIcon icon={faSearch} />
            </div>
          </div>
          <div className="button-item" onClick={handleSendMessageViaButton}>
            <p>send</p>
            <FontAwesomeIcon icon={faPaperPlane} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maincontent;
