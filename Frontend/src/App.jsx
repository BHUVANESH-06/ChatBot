import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import Maincontent from "./Components/Maincontent/Maincontent";

function App() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatNames, setChatNames] = useState([]);
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(
          "https://chatbot-4c9q.onrender.com/api/chats"
        );
        const data = await response.json();
        setChatNames(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchChats();
  });

  return (
    <>
      <Sidebar
        chatNames={chatNames}
        setChatNames={setChatNames}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {selectedChat ? (
        <Maincontent chatId={selectedChat} isSidebarOpen={isSidebarOpen} />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            width: "100%",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              color: "#fff",
            }}
          >
            Select a chat to continue
          </p>
        </div>
      )}
    </>
  );
}

export default App;
