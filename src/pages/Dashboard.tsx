
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  ArrowLeft, 
  MailWarning, 
  Shield, 
  Inbox, 
  Trash,
  BarChart2
} from "lucide-react";
import { 
  Email, 
  getAllEmails, 
  getEmailsByFolder, 
  getSpamStatistics,
  initializeEmailStorage
} from "@/lib/emailStorage";

const COLORS = ['#0088FE', '#FF8042'];

const Dashboard = () => {
  const [spamStats, setSpamStats] = useState({
    totalEmails: 0,
    spamEmails: 0,
    regularEmails: 0,
    spamPercentage: 0,
  });
  const [keywordCounts, setKeywordCounts] = useState<{keyword: string, count: number}[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize email storage if needed
    initializeEmailStorage();
    
    // Get spam statistics
    const stats = getSpamStatistics();
    setSpamStats(stats);
    
    // Generate keyword data
    analyzeSpamKeywords();
  }, []);

  const analyzeSpamKeywords = () => {
    const spamEmails = getEmailsByFolder('spam');
    
    // Simple keyword extraction (in a real app this would be more sophisticated)
    const keywordMap = new Map<string, number>();
    const commonSpamKeywords = [
      'free', 'win', 'congratulations', 'prize', 'money', 
      'urgent', 'act now', 'limited', 'offer', 'exclusive',
      'verify', 'account', 'click', 'link', 'suspended'
    ];
    
    spamEmails.forEach(email => {
      const combinedText = `${email.subject} ${email.content}`.toLowerCase();
      
      commonSpamKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = combinedText.match(regex);
        
        if (matches) {
          const currentCount = keywordMap.get(keyword) || 0;
          keywordMap.set(keyword, currentCount + matches.length);
        }
      });
    });
    
    // Convert to array and sort by count
    const keywordArray = Array.from(keywordMap.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Get top 6 keywords
    
    setKeywordCounts(keywordArray);
  };

  const pieData = [
    { name: 'Regular', value: spamStats.regularEmails },
    { name: 'Spam', value: spamStats.spamEmails },
  ];

  const spamScoreDistribution = () => {
    const emails = getAllEmails();
    const distribution = [
      { name: '0-20%', count: 0 },
      { name: '21-40%', count: 0 },
      { name: '41-60%', count: 0 },
      { name: '61-80%', count: 0 },
      { name: '81-100%', count: 0 },
    ];
    
    emails.forEach(email => {
      const score = email.spamScore;
      if (score <= 20) distribution[0].count++;
      else if (score <= 40) distribution[1].count++;
      else if (score <= 60) distribution[2].count++;
      else if (score <= 80) distribution[3].count++;
      else distribution[4].count++;
    });
    
    return distribution;
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/inbox")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Spam Analytics Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge className="text-sm py-1 px-3" variant="outline">
              <MailWarning className="h-3.5 w-3.5 mr-1" />
              Spam Detection Rate: {spamStats.spamPercentage}%
            </Badge>
            <Badge className="text-sm py-1 px-3" variant="outline">
              <Inbox className="h-3.5 w-3.5 mr-1" />
              Inbox: {getEmailsByFolder('inbox').length}
            </Badge>
            <Badge className="text-sm py-1 px-3" variant="outline">
              <Shield className="h-3.5 w-3.5 mr-1" />
              Spam: {getEmailsByFolder('spam').length}
            </Badge>
            <Badge className="text-sm py-1 px-3" variant="outline">
              <Trash className="h-3.5 w-3.5 mr-1" />
              Trash: {getEmailsByFolder('trash').length}
            </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Email Distribution</CardTitle>
              <CardDescription>Ratio of spam to regular emails</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Common Spam Keywords</CardTitle>
              <CardDescription>Frequency of spam indicators</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={keywordCounts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="keyword" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Spam Score Distribution</CardTitle>
            <CardDescription>Distribution of emails by spam score</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spamScoreDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
