import { useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File | null) => void;
  onSendFile: (file: File | null, caption: string) => void;
}

const Modal = ({ isOpen, onClose, onFileSelect, onSendFile }: ModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  const handleSendFile = () => {
    if (file) {
      onSendFile(file, caption);
      setCaption('');
      setFile(null);
      setShowEmojiPicker(false);
      onClose(); // Close the modal after sending the file
    }
  };

  const handleEmojiSelect = (emoji: EmojiClickData) => {
    setCaption((prev) => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  return (
    isOpen ? (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-80">
          <h2 className="text-lg font-semibold mb-4">Send File</h2>
          <input
            type="file"
            onChange={handleFileChange}
            className="mb-4"
          />
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            rows={4}
            className="w-full border p-2 rounded-lg mb-4"
          />
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition duration-300"
            >
              😊
            </button>
            <button
              onClick={handleSendFile}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
            >
              Send File
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg ml-2 shadow-lg hover:bg-gray-700 transition duration-300"
            >
              Close
            </button>
          </div>
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
              <EmojiPicker onEmojiClick={handleEmojiSelect} />
            </div>
          )}
        </div>
      </div>
    ) : null
  );
};

export default Modal;

