import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Sidebar from './Components/Sidebar/Sidebar'
import Maincontent from './Components/Maincontent/Maincontent'

function App() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isSidebarOpen,setIsSidebarOpen] = useState(false);
  const [chatNames, setChatNames] = useState([
      { chatId: 1, chatName: "Query Handling Optimization", isDeleted: false },
      { chatId: 2, chatName: "Odd Vertex Explanation", isDeleted: false },
      { chatId: 3, chatName: "Database Indexing Strategies", isDeleted: false },
      { chatId: 4, chatName: "React Performance Tuning", isDeleted: false },
      { chatId: 5, chatName: "State Management in Redux", isDeleted: false },
      {
        chatId: 6,
        chatName: "Asynchronous JavaScript Execution",
        isDeleted: false,
      },
      { chatId: 7, chatName: "Graph Traversal Techniques", isDeleted: false },
      { chatId: 8, chatName: "REST vs GraphQL APIs", isDeleted: false },
      { chatId: 9, chatName: "Optimizing SQL Queries", isDeleted: false },
      {
        chatId: 10,
        chatName: "Authentication and Authorization",
        isDeleted: false,
      },
      { chatId: 11, chatName: "Microservices Architecture", isDeleted: false },
      {
        chatId: 12,
        chatName: "Caching Strategies for Web Apps",
        isDeleted: false,
      },
      {
        chatId: 13,
        chatName: "WebSockets for Real-Time Communication",
        isDeleted: false,
      },
      {
        chatId: 14,
        chatName: "Machine Learning Model Deployment",
        isDeleted: false,
      },
      { chatId: 15, chatName: "Docker and Kubernetes Basics", isDeleted: false },
      {
        chatId: 16,
        chatName: "Data Structures and Algorithms",
        isDeleted: false,
      },
      {
        chatId: 17,
        chatName: "Design Patterns in Software Development",
        isDeleted: false,
      },
      { chatId: 18, chatName: "Cybersecurity Best Practices", isDeleted: false },
      { chatId: 19, chatName: "Event-Driven Architecture", isDeleted: false },
      { chatId: 20, chatName: "Concurrency in JavaScript", isDeleted: false },
    ]);
  
  return (
    <>
      <Sidebar chatNames={chatNames} setChatNames={setChatNames} selectedChat={selectedChat} setSelectedChat={setSelectedChat} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}/>
      <Maincontent chatId={selectedChat} isSidebarOpen={isSidebarOpen}/>
    </>
  )
}

export default App
