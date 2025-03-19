import { useState, useEffect, useRef } from "react";
import "./Maincontent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faPaperPlane,
  faPlus,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const Maincontent = ({ chatId, isSidebarOpen }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const fetchMessages = async (chatId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/${chatId}`
      );
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    setIsLoaded(false);
    if (inputValue.trim() !== "" || selectedImage) {
      if (messages.length === 0) {
        let newChatName;
        {
          const formData = new FormData();
          formData.append("user_query", inputValue);
          const response = await fetch(
            "http://localhost:8000/chatbot/generate_title",
            {
              method: "POST",
              body: formData,
            }
          );
          if (!response.ok) {
            throw new Error("Failed to generate title");
          }
        
          const data = await response.json();
          console.log(data);
          newChatName = data.chat_title; 
          console.log(newChatName)
        }
        try{
          const response = await axios.put(
            `http://localhost:5000/api/chats/update/${chatId}`,
            {
              chatName: newChatName,
            }
          );
        }catch(error){
          console.log("An error Occured",error)
        }

      }
      const formData = new FormData();
      formData.append("user_query", inputValue);
      if (selectedImage) {
        formData.append("image", selectedImage.file);
      }
      const newMessage = new FormData();
      newMessage.append("chatId", chatId);
      newMessage.append("text", inputValue);
      newMessage.append("sender", "sender");
      newMessage.append("image", selectedImage?.file);
      const toShow = {
        chatId: chatId,
        text: inputValue,
        sender: "sender",
        image: selectedImage?.preview,
      };
      setMessages([...messages, toShow]);
      setInputValue("");
      setSelectedImage(null);
      setLoading(true);

      try {
        await fetch("http://localhost:5000/api/messages", {
          method: "POST",
          body: newMessage,
        });

        const response = await fetch("http://localhost:8000/chatbot/", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        const botMessage = { chatId, text: data.response, sender: "bot" };

        await fetch("http://localhost:5000/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(botMessage),
        });

        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setLoading(false);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleSendMessage = (event) => {
    if (event.key === "Enter" && (inputValue.trim() !== "" || selectedImage)) {
      sendMessage();
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({ file, preview: reader.result });
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    } else {
      alert("Please select a valid image file.");
    }
  };

  const openFileManager = () => document.getElementById("fileInput").click();

  return (
    <div className={`chat-container ${isSidebarOpen ? "with-sidebar" : ""}`}>
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender}`}>
            {msg.text && (
              <p
                dangerouslySetInnerHTML={{
                  __html: msg.text.replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>"
                  ),
                }}
                style={{ whiteSpace: "pre-line" }}
              />
            )}

            {msg.image ? (
              <img
                src={
                  msg.image.startsWith("data:image/")
                    ? msg.image
                    : `data:image/jpeg;base64,${msg.image}`
                }
                alt="Uploaded"
                className="chat-image"
              />
            ) : (
              msg.sender === "sender" &&
              msg.image?.preview && (
                <img
                  src={msg.image?.preview}
                  alt="Preview"
                  className="chat-image"
                />
              )
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble bot">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="loading-spinner"
            />
          </div>
        )}
      </div>

      {selectedImage?.preview && (
        <div
          className={`image-preview ${
            messages.length === 0 ? "no-messages" : ""
          }`}
        >
          <img
            src={selectedImage.preview}
            alt="Preview"
            className="preview-image"
          />
        </div>
      )}

      <div
        className={`chat-input-container  ${
          messages.length === 0 ? "no-messages" : ""
        }`}
      >
        <textarea
          className="chat-input"
          value={inputValue}
          placeholder="Ask anything..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          onChange={(e) => {
            setInputValue(e.target.value);
            e.target.style.height = "10px";
            e.target.style.height = e.target.scrollHeight + "px"; 
          }}
          rows={1}
          style={{ height: "40px", overflowY: "auto" }} 
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
              onClick={!selectedImage ? openFileManager : null}
            >
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <div
              className="button-item"
              onClick={() => {
                return (location.href = "https://www.google.com");
              }}
            >
              <p>Search</p>
              <FontAwesomeIcon icon={faSearch} />
            </div>
          </div>
          <div
            className="button-item-plus"
            style={{ marginRight: "5px" }}
            onClick={sendMessage}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maincontent;