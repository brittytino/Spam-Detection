
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export interface SpamResult {
  isSpam: boolean;
  score: number;
  text: string;
  highlightedText: string;
  keywords: string[];
  source: 'text' | 'image';
}

interface ResultDisplayProps {
  result: SpamResult | null;
  isLoading: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading }) => {
  const getBadgeColor = (score: number) => {
    if (score < 30) return "bg-green-500";
    if (score < 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusText = (score: number) => {
    if (score < 30) return "Clean";
    if (score < 70) return "Suspicious";
    return "Spam Detected";
  };

  const getEmoji = (score: number) => {
    if (score < 30) return <CheckCircle className="h-6 w-6 text-green-500" />;
    if (score < 70) return <Info className="h-6 w-6 text-yellow-500" />;
    return <AlertCircle className="h-6 w-6 text-red-500" />;
  };

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Analysis Results</span>
            <div className="h-6 w-24 bg-muted rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Info className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No Data to Analyze</h3>
            <p className="text-muted-foreground">
              Upload an image or enter text to analyze for spam content
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Analysis Results</span>
          <Badge className={`${getBadgeColor(result.score)} hover:${getBadgeColor(result.score)}`}>
            {getStatusText(result.score)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Spam Probability: {result.score.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1">
              {getEmoji(result.score)}
            </span>
          </div>
          <Progress value={result.score} className="h-2">
            <div 
              className="progress-bar" 
              style={{
                width: `${result.score}%`,
                backgroundColor: result.score < 30 
                  ? 'rgb(34, 197, 94)' 
                  : result.score < 70 
                    ? 'rgb(234, 179, 8)' 
                    : 'rgb(239, 68, 68)'
              }}
            ></div>
          </Progress>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">Source: {result.source === 'text' ? 'Text Input' : 'Image OCR'}</h3>
          
          {result.keywords.length > 0 ? (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Flagged Keywords:</h4>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword, i) => (
                  <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                No specific spam keywords were detected.
                {result.source === 'image' && ' OCR may have limited accuracy with some images.'}
              </p>
            </div>
          )}
          
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Analyzed Content:</h4>
            <div 
              className="p-3 bg-muted/50 rounded-md text-sm overflow-auto max-h-[200px]"
              dangerouslySetInnerHTML={{ __html: result.highlightedText }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultDisplay;
