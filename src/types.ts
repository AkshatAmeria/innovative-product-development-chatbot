export type EmergencyCategory = 'FIRE' | 'GAS' | 'THEFT' | 'MEDICAL';

export interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface EmergencyResponse {
  category: EmergencyCategory;
  responses: string[];
}