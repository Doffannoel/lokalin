"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, ImageIcon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { useAuth } from "@/app/contexts/AuthContext";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: (postCreated: boolean) => void;
}

type Community = {
  _id: string;
  title: string;
};

export default function CreatePostModal({
  isOpen,
  onClose,
}: CreatePostModalProps) {
  const [postContent, setPostContent] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchCommunities();
    }
  }, [isOpen]);

  const fetchCommunities = async () => {
    try {
      const res = await fetch("/api/community?filter=joined", {
        credentials: "include",
      });
      const data = await res.json();
      setCommunities(data.communities || []);
    } catch (error) {
      console.error("Error fetching communities:", error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setAttachedImages((prevImages) => [...prevImages, ...newFiles]);
      setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDiscardImage = (indexToRemove: number) => {
    URL.revokeObjectURL(imagePreviews[indexToRemove]);

    setAttachedImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, index) => index !== indexToRemove)
    );
  };

  const handlePost = async () => {
    if (!postContent.trim() || !selectedCommunity) {
      setError("Please write something and select a community.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let imageUrl = "";
      if (attachedImages.length > 0) {
        const formData = new FormData();
        formData.append("file", attachedImages[0]);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          throw new Error(uploadData.error || "Failed to upload image");
        }

        imageUrl = uploadData.imageUrl;
      }

      const res = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          desc: postContent,
          image: imageUrl,
          community_id: selectedCommunity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      // Success - close modal
      onClose(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  useEffect(() => {
    if (!isOpen) {
      setPostContent("");
      setSelectedCommunity("");
      setAttachedImages([]);
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setImagePreviews([]);
      setIsDropdownOpen(false);
      setError("");
    }
  }, [isOpen]);

  const selectedCommunityLabel =
    communities.find((c) => c._id === selectedCommunity)?.title ||
    "Select Community";
  const isPostButtonDisabled =
    !postContent.trim() || !selectedCommunity || loading;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose(false)}
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    @{user?.username || "User"}
                  </p>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-800 focus:outline-none"
                    >
                      <span>{selectedCommunityLabel}</span>
                      <motion.div
                        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      >
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
                          className="absolute top-full mt-2 w-max min-w-full bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden max-h-60 overflow-y-auto"
                        >
                          {communities.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              Join a community first
                            </div>
                          ) : (
                            communities.map((community) => (
                              <button
                                key={community._id}
                                onClick={() => {
                                  setSelectedCommunity(community._id);
                                  setIsDropdownOpen(false);
                                }}
                                className="w-full text-left text-sm px-4 py-2 hover:bg-gray-50 transition-colors"
                              >
                                {community.title}
                              </button>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onClose(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                    <div key={index} className="relative w-24 h-24">
                      <Image
                        src={preview}
                        alt={`Image preview ${index + 1}`}
                        fill
                        className="rounded-lg object-cover"
                      />
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
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-gray-600"
              >
                <ImageIcon size={24} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                multiple
              />

              <Button
                onClick={handlePost}
                disabled={isPostButtonDisabled}
                variant="primary"
                className={`transition-opacity ${
                  isPostButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Posting..." : "Post"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
