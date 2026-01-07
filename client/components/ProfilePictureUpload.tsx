'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadProfilePicture } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface ProfilePictureUploadProps {
  currentPicture?: string;
  userName: string;
  onUploadSuccess: (newPictureUrl: string) => void;
}

export default function ProfilePictureUpload({ 
  currentPicture, 
  userName,
  onUploadSuccess 
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadProfilePicture(file);
      setPreview(null);
      onUploadSuccess(result.profilePicture);
      
      // Update localStorage if user data is updated
      if (result.user) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          profilePicture: result.profilePicture
        }));
        window.dispatchEvent(new Event('userUpdated'));
      }
      
      showToast('Profile picture uploaded successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload profile picture', 'error');
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden bg-red-600 flex items-center justify-center">
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          ) : currentPicture ? (
            <Image
              src={currentPicture}
              alt={userName}
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-5xl font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        onClick={handleClick}
        disabled={uploading}
        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg border-2 border-black hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : currentPicture ? 'Change Picture' : 'Upload Picture'}
      </button>
    </div>
  );
}

