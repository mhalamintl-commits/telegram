import { User, SubscriptionPlan, ForwardingRule, SimulatedMessage, ForwardingLog } from '../types';

export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 1,
    name: "Free Tier",
    priceMonthly: 0.00,
    priceYearly: 0.00,
    maxSourceChannels: 2,
    maxDestinationChannels: 2,
    dailyForwardLimit: 50
  },
  {
    id: 2,
    name: "Standard Plan",
    priceMonthly: 15.00,
    priceYearly: 120.00,
    maxSourceChannels: 10,
    maxDestinationChannels: 10,
    dailyForwardLimit: 500
  },
  {
    id: 3,
    name: "VIP Enterprise Pro",
    priceMonthly: 45.00,
    priceYearly: 360.00,
    maxSourceChannels: 50,
    maxDestinationChannels: 50,
    dailyForwardLimit: 5000
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    username: "HDBijoy",
    email: "HDBijoyDJ@gmail.com",
    role: "user",
    planId: 2,
    balance: 85.00,
    joinedAt: "2026-02-15",
    telegramSessions: [
      {
        id: 101,
        phoneNumber: "+14155552671",
        sessionString: "AQH1_V0AsXh9zO1... (Encrypted AES-256)",
        status: "active",
        createdAt: "2026-02-16"
      },
      {
        id: 102,
        phoneNumber: "+14155559876",
        sessionString: "AQH7_A1ZsKm9vY2... (Encrypted AES-256)",
        status: "active",
        createdAt: "2026-05-10"
      }
    ]
  },
  {
    id: 2,
    username: "admin",
    email: "admin@forwarder.com",
    role: "admin",
    planId: 3,
    balance: 999.00,
    joinedAt: "2026-01-01",
    telegramSessions: [
      {
        id: 103,
        phoneNumber: "+17025881472",
        sessionString: "AQH3_Y8AsPp3zU5... (Encrypted AES-256)",
        status: "active",
        createdAt: "2026-01-02"
      }
    ]
  }
];

export const INITIAL_RULES: ForwardingRule[] = [
  {
    id: 1,
    userId: 1,
    sessionPhone: "+14155552671",
    name: "Telecom Daily Post Aggregator",
    sources: ["@telecom_insider", "@telecom_deals", "@telecom_feed"],
    destinations: ["@my_telco_channel"],
    keywordIncludes: ["5G", "Fiber", "Broadband", "Telecom", "ISP"],
    keywordExcludes: ["spam", "promo_code", "giveaway"],
    mediaFilters: {
      text: true,
      photo: true,
      video: true,
      document: true,
      animation: false
    },
    forwardAsCopy: true,
    isEnabled: true,
    createdAt: "2026-03-01"
  },
  {
    id: 2,
    userId: 1,
    sessionPhone: "+14155559876",
    name: "Breaking News & Offers Broadcast",
    sources: ["@broadband_news_global", "10012345678"],
    destinations: ["@my_telco_deals_hub"],
    keywordIncludes: [],
    keywordExcludes: ["ad", "sponsored"],
    mediaFilters: {
      text: true,
      photo: true,
      video: true,
      document: false,
      animation: false
    },
    forwardAsCopy: false,
    isEnabled: false,
    createdAt: "2026-05-12"
  }
];

// Seed logs to show immediate operational transparency
export const INITIAL_LOGS: ForwardingLog[] = [
  {
    id: "log_1",
    ruleName: "Telecom Daily Post Aggregator",
    source: "@telecom_insider",
    destination: "@my_telco_channel",
    messageType: "photo",
    originalText: "Nokia announces brand new 5G fiber transmission lines for commercial buildings in high density business cores.",
    status: "success",
    actionTaken: "Forwarded as Copy (Sender Tag Removed)",
    timestamp: "2026-06-03 15:30:12"
  },
  {
    id: "log_2",
    ruleName: "Telecom Daily Post Aggregator",
    source: "@telecom_deals",
    destination: "@my_telco_channel",
    messageType: "text",
    originalText: "EXCLUSIVE: Use code spam_promo_99 to receive free airtime on registered corporate SIM cards.",
    status: "filtered_keyword",
    actionTaken: "Skipped (Matches Exclude Keyword: spam_promo)",
    timestamp: "2026-06-03 15:28:44"
  },
  {
    id: "log_3",
    ruleName: "Telecom Daily Post Aggregator",
    source: "@telecom_feed",
    destination: "@my_telco_channel",
    messageType: "animation",
    originalText: "Exciting weekend speeds at home! Look at this speeds indicator go!",
    status: "filtered_media",
    actionTaken: "Skipped (Media Filter Blocked animation)",
    timestamp: "2026-06-03 15:20:01"
  },
  {
    id: "log_4",
    ruleName: "Breaking News & Offers Broadcast",
    source: "@broadband_news_global",
    destination: "@my_telco_deals_hub",
    messageType: "video",
    originalText: "Live demonstration of fiber splicing under heavy seasonal rainstorms.",
    status: "success",
    actionTaken: "Standard Forward Completed",
    timestamp: "2026-06-03 15:15:20"
  },
  {
    id: "log_5",
    ruleName: "Telecom Daily Post Aggregator",
    source: "@telecom_insider",
    destination: "@my_telco_channel",
    messageType: "text",
    originalText: "Daily general status check - Connection stable, network latency remains low.",
    status: "filtered_keyword",
    actionTaken: "Skipped (No Keyword Include Match: Need '5G'/'Fiber'/'Broadband'/'Telecom'/'ISP')",
    timestamp: "2026-06-03 15:10:00"
  }
];

// Simulated incoming streams to let users manually test rules against message states
export const SIMULATED_STREAM_MESSAGES: SimulatedMessage[] = [
  {
    id: "msg_1",
    sourceChannel: "@telecom_insider",
    sender: "Telecom Insider Desk",
    text: "Breaking: Ericsson secures new contracts to supply global operators with 5G hardware starting next month.",
    mediaType: "photo",
    mediaUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80",
    timestamp: "Just Now"
  },
  {
    id: "msg_2",
    sourceChannel: "@telecom_deals",
    sender: "Deals Tracker Admin",
    text: "Hurry up! Save 50% on broadband subscriptions for the first year. Ad sponsored by local ISP networks.",
    mediaType: "text",
    timestamp: "1m ago"
  },
  {
    id: "msg_3",
    sourceChannel: "@broadband_news_global",
    sender: "Global Broadband News",
    text: "Subsea fiber optics damaged in the Atlantic channel. Technicians dispatched. Read our coverage here.",
    mediaType: "document",
    fileName: "subsea_damage_assessment_2026.pdf",
    timestamp: "3m ago"
  },
  {
    id: "msg_4",
    sourceChannel: "@telecom_feed",
    sender: "Feed Robot",
    text: "Check out this funny loading GIF representing our old 3G wireless modems!",
    mediaType: "animation",
    timestamp: "5m ago"
  }
];
