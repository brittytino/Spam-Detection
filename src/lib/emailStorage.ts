
export interface Email {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
  };
  recipient: string;
  content: string;
  date: string;
  isRead: boolean;
  isSpam: boolean;
  spamScore: number;
  folder: 'inbox' | 'spam' | 'trash';
  hasAttachment: boolean;
  attachmentType?: 'image' | 'document' | 'other';
  attachmentUrl?: string;
}

// Generate sample emails for testing
const generateSampleEmails = (): Email[] => {
  const spamEmails = [
    {
      id: '1',
      subject: 'CONGRATULATIONS! You have WON a FREE iPhone!',
      sender: { name: 'Prize Department', email: 'prizes@winnersdraw.com' },
      recipient: 'user@example.com',
      content: 'Congratulations! You have been selected as our lucky winner for a brand new iPhone 14 Pro! Click here to claim your FREE prize now! Limited time offer! Don\'t miss out on this exclusive deal!',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isRead: false,
      isSpam: true,
      spamScore: 85,
      folder: 'spam' as const,
      hasAttachment: false
    },
    {
      id: '2',
      subject: 'URGENT: Your Account Will Be Suspended',
      sender: { name: 'Account Service', email: 'security@accounts-verify.com' },
      recipient: 'user@example.com',
      content: 'FINAL NOTICE: Your account has been flagged for suspicious activity. Immediate action required! Verify your account details now to prevent suspension. Click the link below to confirm your identity.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      isRead: false,
      isSpam: true,
      spamScore: 92,
      folder: 'spam' as const,
      hasAttachment: false
    },
    {
      id: '3',
      subject: 'Make Money Fast - Work From Home!',
      sender: { name: 'Business Opportunity', email: 'wealth@richquick.net' },
      recipient: 'user@example.com',
      content: 'Exclusive opportunity! Make $5000 weekly working from home! No risk, guaranteed success. This miracle system has helped thousands get rich quick. Limited spots available - act now!',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      isRead: true,
      isSpam: true,
      spamScore: 78,
      folder: 'spam' as const,
      hasAttachment: true,
      attachmentType: 'image' as const,
      attachmentUrl: '/placeholder.svg'
    }
  ];

  const regularEmails = [
    {
      id: '4',
      subject: 'Team Meeting - Thursday 3PM',
      sender: { name: 'Sarah Johnson', email: 'sarah.j@company.com' },
      recipient: 'user@example.com',
      content: 'Hi team, Just a reminder that we have our weekly status meeting this Thursday at 3PM in Conference Room B. Please come prepared with your project updates. Thanks!',
      date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      isRead: false,
      isSpam: false,
      spamScore: 2,
      folder: 'inbox' as const,
      hasAttachment: false
    },
    {
      id: '5',
      subject: 'Your Order #45692 Has Shipped',
      sender: { name: 'Shop Express', email: 'orders@shopexpress.com' },
      recipient: 'user@example.com',
      content: 'Thank you for your purchase! Your order #45692 has shipped and is expected to arrive within 3-5 business days. You can track your package using the following tracking number: TRK928374655.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      isRead: true,
      isSpam: false,
      spamScore: 5,
      folder: 'inbox' as const,
      hasAttachment: false
    },
    {
      id: '6',
      subject: 'Invitation: Alex\'s Birthday Party',
      sender: { name: 'Alex Chen', email: 'alex.c@friends.com' },
      recipient: 'user@example.com',
      content: 'Hey! I\'m having a small birthday gathering next Saturday at my place, starting around 7PM. Would love to have you join us for some food, drinks and games. Let me know if you can make it!',
      date: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // 28 hours ago
      isRead: true,
      isSpam: false,
      spamScore: 1,
      folder: 'inbox' as const,
      hasAttachment: true,
      attachmentType: 'image' as const,
      attachmentUrl: '/placeholder.svg'
    },
    {
      id: '7',
      subject: 'Quarterly Report - Q3 2023',
      sender: { name: 'Finance Department', email: 'finance@company.com' },
      recipient: 'user@example.com',
      content: 'Dear all, Attached is the Q3 2023 quarterly report for your review. We\'ll be discussing these results during the all-hands meeting next Monday. Please review the document before then.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      isRead: false,
      isSpam: false,
      spamScore: 3,
      folder: 'inbox' as const,
      hasAttachment: true,
      attachmentType: 'document' as const,
      attachmentUrl: '/placeholder.svg'
    }
  ];

  return [...regularEmails, ...spamEmails];
};

// Initialize email storage
export const initializeEmailStorage = (): void => {
  const existingEmails = localStorage.getItem('emails');
  if (!existingEmails) {
    const sampleEmails = generateSampleEmails();
    localStorage.setItem('emails', JSON.stringify(sampleEmails));
  }
};

// Get all emails
export const getAllEmails = (): Email[] => {
  const emails = localStorage.getItem('emails');
  return emails ? JSON.parse(emails) : [];
};

// Get emails by folder
export const getEmailsByFolder = (folder: 'inbox' | 'spam' | 'trash'): Email[] => {
  const emails = getAllEmails();
  return emails.filter(email => email.folder === folder);
};

// Get email by ID
export const getEmailById = (id: string): Email | undefined => {
  const emails = getAllEmails();
  return emails.find(email => email.id === id);
};

// Add a new email
export const addEmail = (email: Omit<Email, 'id' | 'date'>): Email => {
  const emails = getAllEmails();
  const newEmail: Email = {
    ...email,
    id: Math.random().toString(36).substring(2, 11),
    date: new Date().toISOString(),
  };
  
  localStorage.setItem('emails', JSON.stringify([...emails, newEmail]));
  return newEmail;
};

// Update an email
export const updateEmail = (id: string, updates: Partial<Email>): Email | undefined => {
  const emails = getAllEmails();
  const emailIndex = emails.findIndex(email => email.id === id);
  
  if (emailIndex === -1) return undefined;
  
  const updatedEmail = { ...emails[emailIndex], ...updates };
  emails[emailIndex] = updatedEmail;
  
  localStorage.setItem('emails', JSON.stringify(emails));
  return updatedEmail;
};

// Mark email as spam/not spam
export const markEmailAsSpam = (id: string, isSpam: boolean): Email | undefined => {
  return updateEmail(id, { 
    isSpam, 
    folder: isSpam ? 'spam' : 'inbox'
  });
};

// Mark email as read/unread
export const markEmailAsRead = (id: string, isRead: boolean): Email | undefined => {
  return updateEmail(id, { isRead });
};

// Delete email (move to trash)
export const deleteEmail = (id: string): Email | undefined => {
  return updateEmail(id, { folder: 'trash' });
};

// Permanently delete email
export const permanentlyDeleteEmail = (id: string): boolean => {
  const emails = getAllEmails();
  const filteredEmails = emails.filter(email => email.id !== id);
  
  if (filteredEmails.length === emails.length) return false;
  
  localStorage.setItem('emails', JSON.stringify(filteredEmails));
  return true;
};

// Get spam statistics
export const getSpamStatistics = () => {
  const emails = getAllEmails();
  const totalEmails = emails.length;
  const spamEmails = emails.filter(email => email.isSpam).length;
  const spamPercentage = totalEmails > 0 ? (spamEmails / totalEmails) * 100 : 0;
  
  return {
    totalEmails,
    spamEmails,
    regularEmails: totalEmails - spamEmails,
    spamPercentage: Math.round(spamPercentage * 10) / 10, // Round to 1 decimal place
  };
};
