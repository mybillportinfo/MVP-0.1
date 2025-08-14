import React, { useState, useRef } from 'react';
import { Camera, Upload, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageUpdate: (imageUrl: string) => void;
}

export default function ProfilePictureUpload({ currentImage, onImageUpdate }: ProfilePictureUploadProps) {
  const { toast } = useToast();
  const [showOptions, setShowOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      // Convert file to base64 for demo purposes
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onImageUpdate(imageUrl);
        setShowOptions(false);
        toast({
          title: "Profile Picture Updated!",
          description: "Your profile picture has been successfully updated."
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
      setUploading(false);
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeProfilePicture = () => {
    onImageUpdate('');
    setShowOptions(false);
    toast({
      title: "Profile Picture Removed",
      description: "Your profile picture has been removed."
    });
  };

  return (
    <div className="relative">
      {/* Profile Picture Display */}
      <div className="relative w-24 h-24 mx-auto">
        <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
              <User className="w-10 h-10 text-white" />
            </div>
          )}
        </div>
        
        {/* Edit Button */}
        <button
          onClick={() => setShowOptions(true)}
          className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
          data-testid="button-edit-profile-picture"
        >
          <Camera className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Update Profile Picture</h3>
              <button
                onClick={() => setShowOptions(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
                data-testid="button-close-picture-options"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleCameraCapture}
                variant="outline"
                className="w-full justify-start"
                disabled={uploading}
                data-testid="button-camera-capture"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>

              <Button
                onClick={handleGallerySelect}
                variant="outline"
                className="w-full justify-start"
                disabled={uploading}
                data-testid="button-gallery-select"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose from Gallery
              </Button>

              {currentImage && (
                <Button
                  onClick={removeProfilePicture}
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={uploading}
                  data-testid="button-remove-picture"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove Picture
                </Button>
              )}
            </div>

            {uploading && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Uploading...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-gallery"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-camera"
      />
    </div>
  );
}