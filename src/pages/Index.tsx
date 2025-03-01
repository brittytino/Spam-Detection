
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextInput from "@/components/TextInput";
import ImageUpload from "@/components/ImageUpload";
import ResultDisplay from "@/components/ResultDisplay";
import { SpamResult } from "@/components/ResultDisplay";
import { processImageWithOcr } from "@/lib/ocrProcessor";
import { analyzeTextForSpam } from "@/lib/spamDetection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Scan, Shield, Inbox, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initializeEmailStorage } from "@/lib/emailStorage";

const Index = () => {
  const [result, setResult] = useState<SpamResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize email storage system on first load
  React.useEffect(() => {
    initializeEmailStorage();
  }, []);

  const handleTextSubmit = async (text: string) => {
    setIsProcessing(true);
    try {
      console.log("Processing text input:", text.substring(0, 50) + "...");
      
      // Process the text for spam
      const spamAnalysis = analyzeTextForSpam(text);
      
      // Create the result
      const newResult: SpamResult = {
        isSpam: spamAnalysis.isSpam,
        score: spamAnalysis.score,
        text: spamAnalysis.text,
        highlightedText: spamAnalysis.highlightedText,
        keywords: spamAnalysis.keywords,
        source: 'text'
      };
      
      console.log("Text analysis result:", { 
        score: newResult.score, 
        keywords: newResult.keywords,
        isSpam: newResult.isSpam 
      });
      
      // Small delay to show processing
      setTimeout(() => {
        setResult(newResult);
        setIsProcessing(false);
        
        // Show toast notification
        if (newResult.score >= 70) {
          toast({
            title: "Spam Detected!",
            description: "This text contains multiple spam indicators.",
            variant: "destructive",
          });
        } else if (newResult.score >= 30) {
          toast({
            title: "Potentially Suspicious",
            description: "This text has some suspicious elements.",
          });
        } else {
          toast({
            title: "Content Looks Clean",
            description: "No significant spam indicators found.",
          });
        }
      }, 800);
    } catch (error) {
      console.error("Error analyzing text:", error);
      setIsProcessing(false);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing the text. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      console.log("Starting image analysis for:", file.name);
      
      // Process the image with OCR
      const ocrResult = await processImageWithOcr(file);
      
      console.log("OCR completed. Extracted text:", ocrResult.text.substring(0, 100) + "...");
      console.log("OCR confidence:", ocrResult.confidence);
      
      // Then analyze the extracted text for spam
      const spamAnalysis = analyzeTextForSpam(ocrResult.text);
      
      console.log("Spam analysis completed. Score:", spamAnalysis.score);
      console.log("Found keywords:", spamAnalysis.keywords);
      
      // Create the result
      const newResult: SpamResult = {
        isSpam: spamAnalysis.isSpam,
        score: spamAnalysis.score,
        text: ocrResult.text,
        highlightedText: spamAnalysis.highlightedText,
        keywords: spamAnalysis.keywords,
        source: 'image'
      };
      
      setResult(newResult);
      
      // Show toast notification
      if (newResult.score >= 70) {
        toast({
          title: "Spam Detected in Image!",
          description: "The text in this image contains spam indicators.",
          variant: "destructive",
        });
      } else if (newResult.score >= 30) {
        toast({
          title: "Image Content Suspicious",
          description: "The text in this image has some suspicious elements.",
        });
      } else {
        toast({
          title: "Image Content Looks Clean",
          description: "No significant spam indicators found in the image text.",
        });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Processing Failed",
        description: "There was an error extracting text from the image. Please try again with a clearer image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Spam Sentry</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Upload text or images to detect potential spam content using advanced OCR and text analysis.
          </p>
          <div className="flex justify-center mt-4 gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate("/inbox")}
              className="gap-2"
            >
              <Inbox className="h-4 w-4" />
              Email Inbox
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <BarChart2 className="h-4 w-4" />
              Analytics
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-4">
            <Alert className="mb-4 bg-accent/50 border-accent">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>How it works</AlertTitle>
              <AlertDescription>
                Enter text or upload an image containing text. Our system will analyze it for spam indicators and provide a risk score.
              </AlertDescription>
            </Alert>
            
            <Tabs 
              defaultValue="text" 
              className="w-full"
              onValueChange={(value) => setActiveTab(value as "text" | "image")}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="text">Text Analysis</TabsTrigger>
                <TabsTrigger value="image">Image OCR</TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="animate-slide-up">
                <TextInput onTextSubmit={handleTextSubmit} isProcessing={isProcessing} />
              </TabsContent>
              
              <TabsContent value="image" className="animate-slide-up">
                <ImageUpload onImageUpload={handleImageUpload} isProcessing={isProcessing} />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="md:col-span-6">
            <ResultDisplay result={result} isLoading={isProcessing} />
          </div>
        </div>
        
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Spam Sentry OCR - All processing happens in your browser</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
