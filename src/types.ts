export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  planId: number;
  balance: number;
  joinedAt: string;
  telegramSessions: TelegramSession[];
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxSourceChannels: number;
  maxDestinationChannels: number;
  dailyForwardLimit: number;
}

export interface TelegramSession {
  id: number;
  phoneNumber: string;
  sessionString: string;
  status: 'active' | 'expired' | 'connecting';
  createdAt: string;
}

export interface ForwardingRule {
  id: number;
  userId: number;
  sessionPhone: string;
  name: string;
  sources: string[]; // List of source channel usernames/IDs
  destinations: string[]; // List of destination channel usernames/IDs
  keywordIncludes: string[]; // Keywords to require
  keywordExcludes: string[]; // Keywords to filter out
  mediaFilters: {
    text: boolean;
    photo: boolean;
    video: boolean;
    document: boolean;
    animation: boolean;
  };
  forwardAsCopy: boolean; // true = forward as copy (no source tag), false = standard forward
  isEnabled: boolean;
  createdAt: string;
}

export interface SimulatedMessage {
  id: string;
  sourceChannel: string;
  sender: string;
  text: string;
  mediaType: 'text' | 'photo' | 'video' | 'document' | 'animation';
  mediaUrl?: string;
  fileName?: string;
  timestamp: string;
}

export interface ForwardingLog {
  id: string;
  ruleName: string;
  source: string;
  destination: string;
  messageType: string;
  originalText: string;
  status: 'success' | 'filtered_keyword' | 'filtered_media' | 'failed';
  actionTaken: string; // 'Forwarded as Copy', 'Forwarded', 'Skipped (No Include Match)', 'Skipped (Exclude Match)', 'Error: Flood Wait'
  timestamp: string;
}
