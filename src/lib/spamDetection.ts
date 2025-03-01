
// Common spam keywords and patterns
const SPAM_KEYWORDS = [
  // Financial Scams & Free Money
  'congratulations', 'winner', 'claim', 'prize', 'free money', 'get rich', 'make money',
  'earn cash', 'work from home', 'millionaire', 'investment opportunity', 'double your income', 'no risk',
  
  // Urgency & Fear Tactics
  'urgent', 'act now', 'limited time', 'don\'t miss out', 'final notice', 'hurry', 'only for today',
  'immediate response', 'risk-free', 'exclusive deal',
  
  // Phishing & Fake Alerts
  'account suspended', 'verify', 'update payment', 'security alert', 'unusual login',
  'confirm identity', 'reset password', 'account risk', 'unauthorized access', 'billing issue',
  
  // Free Stuff & Giveaways
  'free gift', 'free trial', 'free iphone', '100% free', 'no cost', 'complimentary',
  'special promotion', 'bonus offer', 'free access', 'free membership',
  
  // Fake Shopping & Discounts
  'best price', 'huge discount', 'buy now', 'lowest price', 'discount code',
  'sale ends', 'act fast', 'limited stock', 'today only',
  
  // Medical & Health Scams
  'miracle cure', 'weight loss', 'burn fat', 'anti-aging', 'erectile dysfunction',
  'hair loss', 'instant results', 'guaranteed success', 'no doctor',
  
  // Blacklisted Technical Words
  'click here', 'open attachment', 'exclusive offer', 'no obligation', 'special deal',
  'hidden charges', 'get started now', 'order now',
  
  // General spam keywords
  'viagra', 'cialis', 'xanax', 'rolex', 'replica',
  'lottery', 'nigerian', 'inheritance', 'bank transfer', 'account number',
  'money back', 'cost', 'price', 'casino', 'bitcoin',
  'cash bonus', 'credit', 'password', 'social security', 'SSN', 'bank account',
  'PayPal', 'pharmacy', 'cheap', 'prescription', 'medication',
  'enlargement', 'diet'
];

// Suspicious patterns using regex
const SPAM_PATTERNS = [
  /\d{3}-\d{3}-\d{4}/g, // Phone numbers
  /\$\d+(?:,\d{3})*(?:\.\d{2})?/g, // Currency
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, // Emails
  /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/g, // URLs
  /\bfree\b/gi, // Free keyword
  /\bguarantee\b/gi, // Guarantee keyword
  /\b100%\b/g, // 100% claims
  /\bno obligation\b/gi, // No obligation
  /\binstant\b/gi, // Instant claims
  /!{2,}/g, // Multiple exclamation marks
  /\$\$\$/g, // Dollar signs
  /\bCASH\b/g, // Cash (all uppercase)
  /\bUrgent\b/gi, // Urgent
  /\bAct now\b/gi, // Act now
  /\bBuy now\b/gi, // Buy now
  /\bClick here\b/gi, // Click here
  /\bOrder now\b/gi, // Order now
  /\bLimited time\b/gi, // Limited time
  /\bSpecial offer\b/gi, // Special offer
  /\bWinner\b/gi, // Winner
];

export interface SpamAnalysisResult {
  isSpam: boolean;
  score: number;
  text: string;
  highlightedText: string;
  keywords: string[];
}

export const analyzeTextForSpam = (text: string): SpamAnalysisResult => {
  if (!text || typeof text !== 'string') {
    return {
      isSpam: false,
      score: 0,
      text: '',
      highlightedText: '',
      keywords: [],
    };
  }

  console.log("Analyzing text for spam:", text.substring(0, 100) + "...");
  
  // Initialize variables
  let score = 0;
  const foundKeywords: string[] = [];
  const textLower = text.toLowerCase();
  let highlightedText = text;

  // Check for spam keywords
  SPAM_KEYWORDS.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    if (textLower.includes(keywordLower)) {
      // Each keyword adds 5-10 points depending on how spammy it is
      const keywordScore = keyword.length > 5 ? 10 : 5;
      score += keywordScore;
      foundKeywords.push(keyword);
      
      // Highlight the keyword in the text (case insensitive)
      const regex = new RegExp(keywordLower, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        match => `<span class="spam-highlight">${match}</span>`
      );
      
      console.log(`Found spam keyword: "${keyword}" - Score +${keywordScore}`);
    }
  });

  // Check for suspicious patterns
  SPAM_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      // Each pattern adds 5-15 points
      const patternScore = matches.length * 5;
      score += patternScore;
      
      // Add unique matches to foundKeywords
      matches.forEach(match => {
        if (!foundKeywords.includes(match)) {
          foundKeywords.push(match);
        }
      });
      
      // Highlight the pattern matches
      highlightedText = highlightedText.replace(
        pattern,
        match => `<span class="spam-highlight">${match}</span>`
      );
      
      console.log(`Found suspicious pattern: "${matches[0]}" - Score +${patternScore}`);
    }
  });

  // Check for ALL CAPS text
  const capsSegments = text.match(/[A-Z]{5,}/g);
  if (capsSegments) {
    score += capsSegments.length * 5;
    console.log(`Found ${capsSegments.length} ALL CAPS segments - Score +${capsSegments.length * 5}`);
  }

  // Check for excessive punctuation
  const excessivePunctuation = text.match(/[!?]{3,}/g);
  if (excessivePunctuation) {
    score += excessivePunctuation.length * 3;
    console.log(`Found excessive punctuation - Score +${excessivePunctuation.length * 3}`);
  }

  // Calculate link density
  const urlMatches = text.match(/https?:\/\/[^\s]+/g);
  if (urlMatches) {
    const linkDensity = urlMatches.length / (text.length / 100);
    if (linkDensity > 1) {
      score += 15;
      console.log(`High link density detected - Score +15`);
    }
  }

  // Special case for OCR-derived text: lower the threshold slightly as OCR might miss some spam indicators
  if (text.length > 0 && foundKeywords.length > 0) {
    // Ensure minimal detection for OCR text with spam keywords
    score = Math.max(score, 30);
    console.log(`Ensuring minimal detection score for text with spam keywords: ${score}`);
  }
  
  // Normalize score to 0-100
  score = Math.min(100, score);
  
  console.log(`Final spam score: ${score}, Keywords found: ${foundKeywords.length}`);
  
  return {
    isSpam: score >= 70,
    score,
    text,
    highlightedText,
    keywords: foundKeywords.slice(0, 10), // Limit to top 10 keywords
  };
};
