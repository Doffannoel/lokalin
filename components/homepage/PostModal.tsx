// src/components/homepage/PostModal.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, ImageIcon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

// Define the props the component will accept
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define communities with value and label for our custom dropdown
const communities = [
  { value: "it_support", label: "IT & Support Community" },
  { value: "design_creative", label: "Design & Creative" },
  { value: "marketing_gurus", label: "Marketing Gurus" },
];

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [postContent, setPostContent] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");

  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // const [attachedImage, setAttachedImage] = useState<File | null>(null);
  // const [imagePreview, setImagePreview] = useState<string | null>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null);

  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const dropdownRef = useRef<HTMLDivElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));

      // Append new files and previews to the existing arrays
      setAttachedImages(prevImages => [...prevImages, ...newFiles]);
      setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
    // Reset file input to allow selecting the same file(s) again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDiscardImage = (indexToRemove: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[indexToRemove]);

    // Filter out the image and its preview from the state arrays
    setAttachedImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };

  const handlePost = () => {
    if (!postContent.trim() || !selectedCommunity) {
      alert("Please write something and select a community.");
      return;
    }
    console.log({
      community: selectedCommunity,
      content: postContent,
      image: attachedImages,
    });
    onClose(); // This now also resets the dropdown state via the main modal closing
  };

  // Clicks outside of the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Reset local state when the modal is closed from the parent
  useEffect(() => {
    if (!isOpen) {
      setPostContent("");
      setSelectedCommunity("");
      setAttachedImages([]);
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImagePreviews([]);
      setIsDropdownOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
    
  const selectedCommunityLabel = communities.find(c => c.value === selectedCommunity)?.label || "Select Community";
  const isPostButtonDisabled = !postContent.trim() || !selectedCommunity;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/avatars/avatar-2.png"
                  alt="Clara Cntk"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-sm text-gray-500">@ClaraCntk</p>
                  
                  {/* === NEW: CUSTOM COMMUNITY SELECTOR === */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-800 focus:outline-none"
                    >
                      <span>{selectedCommunityLabel}</span>
                      <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
                        <ChevronDown size={16} />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute top-full mt-2 w-max min-w-full bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden"
                        >
                          {communities.map((community) => (
                            <button
                              key={community.value}
                              onClick={() => {
                                setSelectedCommunity(community.value);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full text-left text-sm px-4 py-2 hover:bg-gray-50 transition-colors"
                            >
                              {community.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {/* === END OF CUSTOM SELECTOR === */}
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 pb-6 pt-0 flex-grow">
              <textarea
                placeholder="Type new post"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full h-60 resize-none text-gray-700 placeholder:text-gray-400 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                autoFocus
              />
              {imagePreviews.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-24 h-24"> {/* Sizing for each preview */}
                      <Image src={preview} alt={`Image preview ${index + 1}`} layout="fill" className="rounded-lg object-cover" />
                      <button
                        onClick={() => handleDiscardImage(index)}
                        className="absolute -top-2 -right-2 bg-gray-800/80 text-white rounded-full p-1 hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                        aria-label={`Discard image ${index + 1}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-gray-600">
                <ImageIcon size={24} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" multiple />
              
              <Button 
                onClick={handlePost}
                disabled={isPostButtonDisabled}
                variant="primary"
                className={`transition-opacity ${isPostButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Post
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}