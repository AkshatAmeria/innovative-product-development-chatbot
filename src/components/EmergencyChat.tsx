import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Send, Bot, User } from 'lucide-react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface EmergencyChatProps {
  apiKey: string;
  className?: string;
  headerClassName?: string;
  chatContainerClassName?: string;
  inputContainerClassName?: string;
}

const EMERGENCY_PROMPT = `You are an advanced emergency response assistant powered by Gemini 2.0 Flash. Your role is to provide clear, concise, and potentially life-saving guidance for emergency situations.

Focus on these emergency categories with specific protocols:
1. FIRE EMERGENCIES
   - Immediate evacuation instructions
   - Fire containment if safe
   - Meeting point guidance
   
2. GAS LEAKS
   - Evacuation procedures
   - Ventilation instructions
   - Safety precautions
   
3. THEFT/SECURITY
   - Personal safety first
   - Evidence preservation
   - Reporting procedures
   
4. MEDICAL EMERGENCIES
   - First aid guidance
   - Patient assessment
   - Emergency service coordination

CRITICAL GUIDELINES:
- Always prioritize life safety
- Emphasize calling emergency services (911/112) for serious situations
- Provide clear, step-by-step instructions
- Keep responses concise but thorough
- Request clarification if the situation is unclear
- Include specific safety warnings when needed`;

export const EmergencyChat: React.FC<EmergencyChatProps> = ({
  apiKey,
  className = "w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden",
  headerClassName = "bg-red-600 p-4 flex items-center gap-2",
  chatContainerClassName = "h-[500px] overflow-y-auto p-4 flex flex-col gap-4",
  inputContainerClassName = "p-4 border-t border-gray-200"
}) => {
  const [messages, setMessages] = useState<Message[]>([{
    text: "Hello! I'm your emergency response assistant. How can I help you today?",
    sender: 'bot',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getGeminiResponse = async (userInput: string): Promise<string> => {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          maxOutputTokens: 250,
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      });

      const prompt = `${EMERGENCY_PROMPT}\n\nEmergency Query: ${userInput}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting Gemini response:', error);
      return "I apologize, but I'm having trouble processing your request. For immediate emergency assistance, please call your local emergency services (911/112).";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getGeminiResponse(input);
      
      setMessages(prev => [...prev, {
        text: response,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        text: "I apologize, but I'm having trouble processing your request. For immediate emergency assistance, please call your local emergency services (911/112).",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isBot = message.sender === 'bot';
    
    return (
      <div className={`flex gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isBot ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {isBot ? <Bot size={20} /> : <User size={20} />}
        </div>
        <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isBot ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'
        }`}>
          <p className="text-sm">{message.text}</p>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <div className={headerClassName}>
        <AlertTriangle className="text-white" size={24} />
        <h1 className="text-xl font-bold text-white">Emergency Response Assistant</h1>
      </div>
      
      <div className={chatContainerClassName}>
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={inputContainerClassName}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your emergency-related question..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-red-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            <Send size={20} />
            {isLoading ? 'Processing...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};