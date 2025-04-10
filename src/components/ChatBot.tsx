import { useState } from "react";
import { FiX } from "react-icons/fi";
import { GiMegaphone } from "react-icons/gi";
import { motion } from "framer-motion";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const EMERGENCY_PROMPT = `You are an advanced emergency response assistant. Provide concise, clear, and potentially life-saving guidance for emergency situations. Focus on the following category: {CATEGORY}. Keep responses brief and actionable.`;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const cases = {
    Fire: [
      { question: "What should I do in case of a fire?", answer: "Evacuate immediately and call emergency services at 101." },
      { question: "How can I prevent fires at home?", answer: "Ensure electrical wiring is up to code and never leave stoves unattended." },
      { question: "What should I do if my clothes catch fire?", answer: "Stop, drop, and roll to smother the flames." },
      { question: "How do I use a fire extinguisher?", answer: "Remember PASS: Pull the pin, Aim at the base, Squeeze the handle, and Sweep side to side." },
      { question: "What should I do if I'm trapped in a burning building?", answer: "Stay low to avoid smoke, find a safe exit, and signal for help from a window." },
      { question: "Can I use water on an electrical fire?", answer: "No, use a Class C fire extinguisher instead." },
      { question: "How often should I check my smoke alarms?", answer: "At least once a month." }
    ],
    Gas: [
      { question: "How do I report a gas leak?", answer: "Leave the area and call emergency services at 1906." },
      { question: "What are the signs of a gas leak?", answer: "A strong sulfur smell, hissing sounds, or dizziness indoors." },
      { question: "What should I do if I smell gas in my house?", answer: "Turn off the gas supply, avoid using electrical switches, and ventilate the area." },
      { question: "How can I prevent gas leaks?", answer: "Regularly check gas connections and install a gas leak detector." },
      { question: "What are the health risks of gas leaks?", answer: "Headaches, dizziness, nausea, and even unconsciousness in severe cases." },
      { question: "Should I use my phone if I suspect a gas leak?", answer: "No, using electrical devices can ignite the gas." },
      { question: "How often should I inspect gas lines?", answer: "At least once a year by a professional." }
    ],
    Medical: [
      { question: "What number do I call for medical emergencies?", answer: "Dial 108 for an ambulance." },
      { question: "How do I perform CPR?", answer: "Check responsiveness, call for help, and give chest compressions." },
      { question: "What should I do if someone is choking?", answer: "Perform the Heimlich maneuver by applying abdominal thrusts." },
      { question: "How do I treat a deep cut or wound?", answer: "Apply pressure to stop bleeding, clean the wound, and cover it with a sterile bandage." },
      { question: "What are the symptoms of a stroke?", answer: "Face drooping, arm weakness, and slurred speech." },
      { question: "How do I identify a heart attack?", answer: "Chest pain, shortness of breath, and nausea." },
      { question: "What is the best way to treat burns?", answer: "Cool the burn with running water and cover it with a sterile dressing." }
    ]
  };

  const getGeminiResponse = async (question: string, category: string): Promise<string> => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    
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

      const prompt = `${EMERGENCY_PROMPT.replace("{CATEGORY}", category)}\n\nQuestion: ${question}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting Gemini response:', error);
      return "I apologize, but I'm having trouble processing your request. For immediate emergency assistance, please call your local emergency services.";
    }
  };

  const handleQuestionClick = async (q) => {
    setMessages((prev) => [...prev, { text: q.question, isBot: false }]);
    setIsLoading(true);
    
    try {
      const aiResponse = await getGeminiResponse(q.question, selectedCase);
      setMessages((prev) => [...prev, { text: aiResponse, isBot: true }]);
    } catch (error) {
      setMessages((prev) => [...prev, { 
        text: "I apologize, but I'm having trouble processing your request. For immediate emergency assistance, please call your local emergency services.", 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX /> : <GiMegaphone />}
      </button>

      {isOpen && (
        <motion.div 
          className="chat-window" 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="chat-messages" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                Generating response...
              </div>
            )}
          </div>

          {selectedCase && (
            <div className="chat-questions" style={{ maxHeight: "150px", overflowY: "auto" }}>
              {cases[selectedCase].slice(0, 5).map((q, index) => (
                <button 
                  key={index} 
                  className="question-btn" 
                  onClick={() => handleQuestionClick(q)}
                  disabled={isLoading}
                >
                  {q.question}
                </button>
              ))}
            </div>
          )}

          <div className="chat-footer">
            <div className="chat-categories">
              {Object.keys(cases).map((category) => (
                <button 
                  key={category} 
                  className="category-btn" 
                  onClick={() => setSelectedCase(category)}
                  disabled={isLoading}
                >
                  {category}
                </button>
              ))}
            </div>
            <button 
              className="clear-chat" 
              onClick={clearChat}
              disabled={isLoading}
            >
              Clear Chat
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ChatBot;