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
import Maincontent from "../Maincontent/Maincontent";
const Sidebar = ({chatNames,setChatNames,selectedChat,setSelectedChat,isSidebarOpen,setIsSidebarOpen}) => {
  const [isSelected, setIsSelected] = useState();
  
  const handleAddChat = () => {
    const newChat = {
      chatId: chatNames.length + 1,
      chatName: "New Chat",
      isDeleted: false,
    };
    setChatNames([newChat, ...chatNames]);
  };
  const deleteChat = (chatId) => {
    setChatNames(
      chatNames.map((chat) =>
        chat.chatId === chatId ? { ...chat, isDeleted: true } : chat
      )
    );
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
