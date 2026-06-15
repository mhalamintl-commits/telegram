export interface TelegramClientConfig {
  apiId: string;
  apiHash: string;
  phoneNumber: string;
  status: 'connected' | 'disconnected' | 'connecting';
  sessionString?: string;
  twoFactorPassword?: string;
  authType?: 'user' | 'bot';
  botToken?: string;
  botUsername?: string;
  botId?: number;
  botFirstName?: string;
  userUsername?: string;
  userId?: string;
  userFirstName?: string;
  canJoinGroups?: boolean;
  canReadAllGroupMessages?: boolean;
  verifiedAt?: string;
}

export interface ReplaceRule {
  id: string;
  find: string;
  replace: string;
}

export interface Forwarder {
  id: string;
  name: string;
  sources: string[];
  targets: string[];
  includeWords: string[];
  excludeWords: string[];
  replaceRules: ReplaceRule[];
  mediaOnly: boolean;
  textOnly: boolean;
  isActive: boolean;
  totalForwarded: number;
  lastForwardedAt?: string;
  headerTemplate?: string;
  footerTemplate?: string;
  webhookUrl?: string;
}

export interface ForwardingLog {
  id: string;
  forwarderId: string;
  forwarderName: string;
  sourceChat: string;
  targetChat: string;
  originalText: string;
  processedText: string;
  status: 'success' | 'filtered' | 'failed';
  reason?: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  plan: 'Free' | 'Monthly' | 'Yearly' | 'Enterprise';
  telegramClient: TelegramClientConfig;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface BillingInvoice {
  id: string;
  planId: 'Free' | 'Monthly' | 'Yearly' | 'Enterprise';
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'expired';
  paymentUrl: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
}

export interface SubscriptionPlan {
  id: 'Free' | 'Monthly' | 'Yearly' | 'Enterprise';
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'Free',
    name: 'Free Starter',
    price: 0,
    period: 'forever',
    description: 'Perfect for exploring and small automation needs.',
    features: [
      '1 Active Post Forwarder',
      'Up to 50 forwarded messages/day',
      'Basic keyword filtering',
      'Standard 60-second forwarding latency',
      'Web-based logs screen (24-hour retention)'
    ]
  },
  {
    id: 'Monthly',
    name: 'Pro Monthly',
    price: 9.99,
    period: 'month',
    description: 'Ideal for channels, creators & active communities.',
    features: [
      'Unlimited Active Forwarders',
      'No daily limits on forwarded posts',
      'Advanced find & replace text rules',
      'Instant forwarding latency (real-time)',
      '24/7 dedicated online forwarding runner',
      'Log history screen with 30-day retention'
    ]
  },
  {
    id: 'Yearly',
    name: 'Pro Yearly',
    price: 79.99,
    period: 'year',
    description: 'Grow your network with maximum efficiency and high speed.',
    features: [
      'All Pro Monthly features included',
      'Save over 30% compared to monthly billed plans',
      'Priority routing queue processing (high-speed)',
      'Exclusive regex text filters support',
      'Premium discord/telegram developer support'
    ]
  },
  {
    id: 'Enterprise',
    name: 'Enterprise Scale',
    price: 199.99,
    period: 'year',
    description: 'Bespoke infrastructure for mass syndication networks.',
    features: [
      'All Pro features included',
      'Dedicated forwarding container instance',
      'SLA guarantee on server uptime (99.99%)',
      'White-label forwarding headers customization',
      'Custom API webhooks for forward outcomes',
      'Full administrative CSV log export capability'
    ]
  }
];
