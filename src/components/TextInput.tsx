
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TextInputProps {
  onTextSubmit: (text: string) => void;
  isProcessing: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ onTextSubmit, isProcessing }) => {
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onTextSubmit(text);
    }
  };

  return (
    <Card className="w-full mb-4 animate-fade-in">
      <div 
        className="px-4 py-3 flex justify-between items-center cursor-pointer border-b"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-medium">Text Input</h3>
        <Button variant="ghost" size="sm">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </div>
      
      {expanded && (
        <CardContent className="pt-4 animate-slide-down">
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="message">Enter text to analyze for spam</Label>
              <Textarea
                id="message"
                placeholder="Paste email text or type a message to analyze for spam content..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[120px] resize-y"
              />
            </div>
            <Button 
              type="submit" 
              className="mt-4" 
              disabled={!text.trim() || isProcessing}
            >
              {isProcessing ? "Analyzing..." : "Analyze Text"}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
};

export default TextInput;
