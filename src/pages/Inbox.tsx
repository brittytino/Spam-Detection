
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MailOpen, 
  Trash, 
  AlertCircle, 
  MailWarning, 
  Inbox as InboxIcon, 
  Clock, 
  Paperclip
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Email, getEmailsByFolder, initializeEmailStorage, markEmailAsRead, markEmailAsSpam, deleteEmail } from "@/lib/emailStorage";
import { formatDistanceToNow } from "date-fns";

const Inbox = () => {
  const [activeTab, setActiveTab] = useState<"inbox" | "spam" | "trash">("inbox");
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize email storage with sample data if empty
    initializeEmailStorage();
    loadEmails(activeTab);
  }, [activeTab]);

  const loadEmails = (folder: "inbox" | "spam" | "trash") => {
    const folderEmails = getEmailsByFolder(folder);
    setEmails(folderEmails);
    setSelectedEmail(null);
  };

  const handleSelectEmail = (email: Email) => {
    if (!email.isRead) {
      const updated = markEmailAsRead(email.id, true);
      if (updated) {
        loadEmails(activeTab);
      }
    }
    setSelectedEmail(email);
  };

  const handleMarkAsSpam = (email: Email) => {
    const isSpam = !email.isSpam;
    const updated = markEmailAsSpam(email.id, isSpam);
    if (updated) {
      toast({
        title: isSpam ? "Marked as spam" : "Marked as not spam",
        description: isSpam ? "Email moved to spam folder" : "Email moved to inbox",
      });
      loadEmails(activeTab);
      setSelectedEmail(null);
    }
  };

  const handleDelete = (email: Email) => {
    const deleted = deleteEmail(email.id);
    if (deleted) {
      toast({
        title: "Email deleted",
        description: "Email moved to trash",
      });
      loadEmails(activeTab);
      setSelectedEmail(null);
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "some time ago";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Email Inbox</h1>
          <p className="text-muted-foreground max-w-2xl">
            View and manage your emails with our built-in spam detection system
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar / Navigation */}
          <div className="md:col-span-3 space-y-4">
            <Card>
              <CardContent className="p-4">
                <Tabs 
                  defaultValue="inbox" 
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as "inbox" | "spam" | "trash")}
                  className="w-full"
                  orientation="vertical"
                >
                  <TabsList className="flex flex-col h-auto items-start justify-start w-full gap-2 bg-transparent">
                    <TabsTrigger 
                      value="inbox" 
                      className="w-full justify-start gap-2 px-3 data-[state=active]:bg-accent/50"
                    >
                      <InboxIcon className="h-4 w-4" />
                      <span>Inbox</span>
                      <Badge variant="outline" className="ml-auto">
                        {getEmailsByFolder("inbox").filter(e => !e.isRead).length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="spam" 
                      className="w-full justify-start gap-2 px-3 data-[state=active]:bg-accent/50"
                    >
                      <MailWarning className="h-4 w-4" />
                      <span>Spam</span>
                      <Badge variant="outline" className="ml-auto">
                        {getEmailsByFolder("spam").length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="trash" 
                      className="w-full justify-start gap-2 px-3 data-[state=active]:bg-accent/50"
                    >
                      <Trash className="h-4 w-4" />
                      <span>Trash</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Actions</h3>
                  <div className="space-y-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start" 
                      onClick={() => navigate("/dashboard")}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Spam Dashboard
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start" 
                      onClick={() => navigate("/")}
                    >
                      <MailOpen className="h-4 w-4 mr-2" />
                      Spam Detector
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-9">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  {/* Email List */}
                  <div className="border-r h-[70vh] overflow-auto">
                    <div className="p-4 border-b">
                      <h2 className="font-medium capitalize">{activeTab}</h2>
                    </div>

                    {emails.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <MailOpen className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>No emails in this folder</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {emails.map((email) => (
                          <div 
                            key={email.id}
                            className={`p-4 cursor-pointer transition-colors hover:bg-accent/50 ${selectedEmail?.id === email.id ? 'bg-accent/50' : ''} ${!email.isRead ? 'font-medium' : ''}`}
                            onClick={() => handleSelectEmail(email)}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-medium truncate max-w-[70%]">{email.sender.name}</span>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{getTimeAgo(email.date)}</span>
                            </div>
                            <div className="text-sm font-medium mb-1 truncate">{email.subject}</div>
                            <div className="text-xs text-muted-foreground truncate">{email.content.slice(0, 60)}...</div>
                            <div className="flex gap-2 mt-2">
                              {email.hasAttachment && (
                                <Paperclip className="h-3 w-3 text-muted-foreground" />
                              )}
                              {email.isSpam && (
                                <MailWarning className="h-3 w-3 text-destructive" />
                              )}
                              {!email.isRead && (
                                <div className="h-2 w-2 rounded-full bg-blue-500 mt-0.5" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Email Detail */}
                  <div className="h-[70vh] overflow-auto">
                    {selectedEmail ? (
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold">{selectedEmail.subject}</h3>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleMarkAsSpam(selectedEmail)}
                              title={selectedEmail.isSpam ? "Not spam" : "Mark as spam"}
                            >
                              <MailWarning className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleDelete(selectedEmail)}
                              title="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mb-4 pb-4 border-b">
                          <div className="flex justify-between">
                            <div>
                              <div className="font-medium">{selectedEmail.sender.name}</div>
                              <div className="text-sm text-muted-foreground">{selectedEmail.sender.email}</div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{getTimeAgo(selectedEmail.date)}</span>
                            </div>
                          </div>
                        </div>

                        {selectedEmail.isSpam && (
                          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-destructive" />
                              <span className="font-medium text-destructive">This email was marked as spam</span>
                            </div>
                            <div className="mt-1 pl-6">
                              <span>Spam score: {selectedEmail.spamScore}%</span>
                            </div>
                          </div>
                        )}

                        <div className="prose prose-sm max-w-none">
                          <p>{selectedEmail.content}</p>
                        </div>

                        {selectedEmail.hasAttachment && (
                          <div className="mt-6 p-4 border rounded-md">
                            <div className="flex items-center gap-3">
                              <Paperclip className="h-4 w-4" />
                              <span className="text-sm font-medium">Attachment.{selectedEmail.attachmentType === 'image' ? 'jpg' : 'pdf'}</span>
                              <Button variant="outline" size="sm" className="ml-auto">
                                View
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center p-8">
                        <div>
                          <MailOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                          <h3 className="text-lg font-medium mb-1">No email selected</h3>
                          <p className="text-muted-foreground">Select an email from the list to view its contents</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
