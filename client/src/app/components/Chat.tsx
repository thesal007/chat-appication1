'use client'
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { formatDistanceToNow } from "date-fns";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { FaFolderOpen, FaSmile, FaEnvelope, FaArrowLeft } from "react-icons/fa";

import Modal from "./Modal";

const socket = io("http://localhost:4000");

const Chat = () => {
  const [privateMessages, setPrivateMessages] = useState<{ [user: string]: { from: string; message: string; timestamp: string }[] }>({});
  const [receivedFiles, setReceivedFiles] = useState<{ [user: string]: { from: string; fileName: string; fileUrl: string; fileType: string; caption?: string }[] }>({});
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [privateMessage, setPrivateMessage] = useState("");
  const [typingStatus, setTypingStatus] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ [key: string]: number }>({});
  const [showActiveUsers, setShowActiveUsers] = useState(true);

  useEffect(() => {
    const handlePrivateMessage = (message: { from: string; message: string; timestamp: string }) => {
      setPrivateMessages((prevMessages) => ({
        ...prevMessages,
        [message.from]: [...(prevMessages[message.from] || []), message],
      }));

      if (message.from !== username && selectedUser !== message.from) {
        setNotifications((prevNotifications) => ({
          ...prevNotifications,
          [message.from]: (prevNotifications[message.from] || 0) + 1,
        }));
      }
    };

    const handleFileReceive = (data: { from: string; fileName: string; file: ArrayBuffer; fileType: string; caption?: string }) => {
      const blob = new Blob([data.file], { type: data.fileType });
      const fileUrl = URL.createObjectURL(blob);

      setReceivedFiles((prevFiles) => ({
        ...prevFiles,
        [data.from]: [...(prevFiles[data.from] || []), {
          from: data.from,
          fileName: data.fileName,
          fileUrl,
          fileType: data.fileType,
          caption: data.caption || "",
        }],
      }));
    };

    const handleActiveUsers = (users: string[]) => {
      setActiveUsers(users);
    };

    const handleTyping = (user: string) => {
      setTypingStatus(`${user} is typing...`);
      setTimeout(() => setTypingStatus(null), 3000);
    };

    socket.on("receive_private_message", handlePrivateMessage);
    socket.on("receive_file", handleFileReceive);
    socket.on("active_users", handleActiveUsers);
    socket.on("user_typing", handleTyping);

    return () => {
      socket.off("receive_private_message", handlePrivateMessage);
      socket.off("receive_file", handleFileReceive);
      socket.off("active_users", handleActiveUsers);
      socket.off("user_typing", handleTyping);
    };
  }, [selectedUser, username]);

  const handleSendPrivateMessage = () => {
    try {
      if (privateMessage.trim() && selectedUser && username) {
        const timestamp = new Date().toISOString();
        setPrivateMessages((prevMessages) => ({
          ...prevMessages,
          [selectedUser]: [
            ...(prevMessages[selectedUser] || []),
            { from: username, message: privateMessage, timestamp },
          ],
        }));
        socket.emit("send_private_message", { toUsername: selectedUser, message: privateMessage, timestamp });
        setPrivateMessage("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleSendFile = (file: File | null, caption: string) => {
    if (file && selectedUser && username) {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        if (arrayBuffer) {
          socket.emit("send_file", {
            toUsername: selectedUser,
            fileName: file.name,
            file: arrayBuffer,
            fileType: file.type,
            caption,
          });
          setSelectedFile(null);
          setIsModalOpen(false);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleLogin = () => {
    const name = prompt("Enter your username");
    if (name) {
      setUsername(name);
      socket.emit("login", name);
    }
  };

  const handleTyping = () => {
    if (selectedUser && username) {
      socket.emit("typing", { toUsername: selectedUser });
    }
  };

  const handleEmojiSelect = (emoji: EmojiClickData) => {
    setPrivateMessage((prev) => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  const handleUserClick = (user: string) => {
    setSelectedUser(user);
    setShowActiveUsers(false);
    setNotifications((prevNotifications) => ({
      ...prevNotifications,
      [user]: 0,
    }));
  };

  const handleBackToActiveUsers = () => {
    setSelectedUser(null);
    setShowActiveUsers(true);
  };

  const renderMessages = () => {
    const userMessages = privateMessages[selectedUser || ""] || [];
    const userFiles = receivedFiles[selectedUser || ""] || [];

    return (
      <>
        {userMessages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 flex ${msg.from === username ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs break-words ${msg.from === username ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}
            >
              {msg.message}
              <div
                className={`text-xs text-gray-400 mt-1 ${msg.from === username ? "text-right" : "text-left"}`}
              >
                {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
        {userFiles.map((file) => renderFile(file))}
        {typingStatus && <div className="text-gray-500 text-sm mt-2">{typingStatus}</div>}
      </>
    );
  };

  const renderFile = (file: { from: string; fileName: string; fileUrl: string; fileType: string; caption?: string }) => {
    const isSentByCurrentUser = file.from === username;

    return (
      <div key={file.fileUrl} className={`mb-2 flex ${isSentByCurrentUser ? "justify-end" : "justify-start"}`}>
        <div className={`p-3 rounded-lg ${isSentByCurrentUser ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
          {file.fileType.startsWith("image/") ? (
            <img src={file.fileUrl} alt={file.fileName} className="w-32 h-32 object-contain rounded-lg" />
          ) : (
            <a href={file.fileUrl} download={file.fileName} className="text-blue-500 underline">
              {file.fileName}
            </a>
          )}
          {file.caption && <p className="text-xs mt-1">{file.caption}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {!username ? (
        <div className="flex justify-center items-center h-full">
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
          >
            <FaEnvelope size={20} />
          </button>
        </div>
      ) : (
        <div className="flex flex-1 h-full">
          {/* Active Users List */}
          {(showActiveUsers || selectedUser === null || window.innerWidth >= 1280) && (
            <div className="w-full xl:w-1/4 bg-gray-800 text-white p-4 overflow-y-auto h-full xl:block">
              <h2 className="text-lg font-semibold mb-4">Active Users</h2>
              <ul className="space-y-3">
                {activeUsers
                  .filter((user) => user !== username)
                  .map((user, index) => (
                    <li
                      key={index}
                      onClick={() => handleUserClick(user)}
                      className={`cursor-pointer p-2 rounded-lg transition-colors duration-300 ${
                        selectedUser === user
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-200 hover:bg-blue-500'
                      }`}
                    >
                      {user}
                      {notifications[user] > 0 && (
                        <span className="ml-[78%] bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {notifications[user]}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Chat Area */}
          {(selectedUser !== null || window.innerWidth >= 1280) && (
            <div className="flex-1 flex flex-col bg-gray-100 h-full">
              {/* Chat Header with Back Button */}
              <div className="bg-white shadow-md p-4 flex items-center justify-between">
                {window.innerWidth < 1280 && !showActiveUsers && (
                  <button
                    onClick={handleBackToActiveUsers}
                    className="xl:hidden text-blue-500"
                  >
                    <FaArrowLeft size={20} />
                  </button>
                )}
                <h3 className="text-xl font-semibold">
                  {selectedUser ? `Chat with ${selectedUser}` : 'No user selected'}
                </h3>
                <div className="w-8" /> {/* Placeholder for spacing */}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto">{renderMessages()}</div>

              {/* Chat Input */}
              <div className="bg-gray-200 p-4 flex items-center space-x-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-500 text-white p-2 rounded-lg flex items-center justify-center"
                >
                  <FaFolderOpen size={20} />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={privateMessage}
                    onChange={(e) => setPrivateMessage(e.target.value)}
                    onFocus={() => {
                      // Handle user typing indicator logic
                      handleTyping();
                    }}
                    className="w-full p-2 rounded-lg border border-gray-300"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSendPrivateMessage();
                    }}
                    placeholder="Type a message"
                  />
                  <button
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center"
                  >
                    <FaSmile size={20} />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0">
                      <EmojiPicker onEmojiClick={handleEmojiSelect} />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSendPrivateMessage}
                  className="bg-blue-500 text-white p-2 rounded-lg"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onFileSelect={(file) => setSelectedFile(file)}
          onSendFile={(file, caption) => selectedFile && handleSendFile(selectedFile, caption)}
        />
      )}
    </div>
  );
};

export default Chat;
