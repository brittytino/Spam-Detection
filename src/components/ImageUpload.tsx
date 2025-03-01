
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, isProcessing }) => {
  const [image, setImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check if the file is an image
    if (!file.type.match('image.*')) {
      alert('Please upload an image file');
      return;
    }
    
    console.log("File selected:", file.name, file.type, file.size);
    
    // Create a URL for the image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target) {
        setImage(e.target.result as string);
        // Don't automatically process the image, wait for user to click the analyze button
      }
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeImage = () => {
    if (fileInputRef.current?.files?.[0]) {
      console.log("Analyzing image:", fileInputRef.current.files[0].name);
      onImageUpload(fileInputRef.current.files[0]);
    }
  };

  return (
    <Card className="w-full mb-4 animate-fade-in">
      <div 
        className="px-4 py-3 flex justify-between items-center cursor-pointer border-b"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-medium">Image Upload</h3>
        <Button variant="ghost" size="sm">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </div>
      
      {expanded && (
        <CardContent className="pt-4 animate-slide-down">
          <div 
            className={`image-upload-area p-8 rounded-md flex flex-col items-center justify-center text-center cursor-pointer h-[200px] relative border-2 border-dashed ${dragActive ? 'border-primary' : 'border-gray-300'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleButtonClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleChange}
              accept="image/*"
              disabled={isProcessing}
            />
            
            {image ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={image} 
                  alt="Uploaded preview" 
                  className="max-h-full max-w-full object-contain" 
                />
                <button 
                  className="absolute top-0 right-0 bg-background/80 p-1 rounded-full"
                  onClick={clearImage}
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-2 text-muted-foreground">
                  <ImageIcon size={48} strokeWidth={1.5} />
                </div>
                <p className="text-muted-foreground mb-2">
                  Drag and drop an image or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG
                </p>
              </>
            )}
          </div>
          
          <Button 
            className="mt-4 w-full" 
            disabled={!image || isProcessing} 
            onClick={analyzeImage}
          >
            {isProcessing ? "Processing..." : "Analyze Image"}
          </Button>
          
          {image && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Images with text will be analyzed for spam content. The OCR process might take a moment.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ImageUpload;
