import React, { useState } from "react";
import "./Sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faSearch,
  faPenToSquare,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({
  chatNames,
  setChatNames,
  selectedChat,
  setSelectedChat,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const [isSelected, setIsSelected] = useState();
  const [length, setLength] = useState(0);
  const handleAddChat = async () => {
    try {
      // Fetch all chats to get the current count
      const response = await fetch("http://localhost:5000/api/chats/allChats", {
        method: "GET",
      });

      if (!response.ok) {
        console.error("Error fetching chats:", response.statusText);
        return;
      }

      const data = await response.json();
      console.log("Fetched chats:", data);

      if (!Array.isArray(data)) {
        console.error("Invalid data format:", data);
        return;
      }

      const newChatId = data.length + 1;

      const newChat = {
        chatId: newChatId,
        chatName: "New Chat",
        isDeleted: false,
      };

      console.log("Creating new chat with ID:", newChatId);
      const postResponse = await fetch("http://localhost:5000/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newChat),
      });

      if (!postResponse.ok) throw new Error("Failed to create chat");

      const savedChat = await postResponse.json();
      console.log("New chat saved:", savedChat);

      setChatNames([savedChat, ...chatNames]); 
    } catch (error) {
      console.error("Error adding chat:", error);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        method: "DELETE",
      });
      setChatNames(
        chatNames.map((chat) =>
          chat.chatId === chatId ? { ...chat, isDeleted: true } : chat
        )
      );
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const searchButton = () => {
    console.log("Search button Clicked");
  };
  const sidebarFunctionality = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    <>
      <div>
        {!isSidebarOpen && (
          <FontAwesomeIcon
            icon={faBars}
            className="sidebar-toggle-icon"
            onClick={sidebarFunctionality}
          />
        )}
        <div
          className={`sidebar-container ${
            isSidebarOpen ? "" : "sidebar-collapsed"
          }`}
        >
          <div className="sidebar-title">
            <div>
              {isSidebarOpen && (
                <FontAwesomeIcon
                  icon={faTimes}
                  className="menu-icon"
                  style={{ fontSize: "28px" }}
                  onClick={sidebarFunctionality}
                />
              )}
            </div>
            <div className="right-logo">
              <FontAwesomeIcon
                icon={faSearch}
                className="menu-icon"
                onClick={searchButton}
              />
              <FontAwesomeIcon
                icon={faPenToSquare}
                className="menu-icon"
                onClick={handleAddChat}
              />
            </div>
          </div>

          <div className="inside-chats">
            {chatNames
              .filter((chat) => !chat.isDeleted)
              .map((chat) => (
                <div
                  key={chat.chatId}
                  className="chat-title-container"
                  onClick={() => {
                    setSelectedChat(chat.chatId);
                    setIsSelected(chat.chatId);
                  }}
                >
                  <p
                    className={`chat-title ${
                      isSelected === chat.chatId ? "chat-title-selected" : ""
                    }`}
                  >
                    {chat.chatName}
                  </p>
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="delete-icon"
                    onClick={() => deleteChat(chat.chatId)}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
