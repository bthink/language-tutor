import styled from 'styled-components';
import { useState, useCallback, useEffect } from 'react';
import { OpenAIService } from './services/openai';
import { VoiceService } from './services/voice';
import { Conversation } from './models/conversation';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Tile = styled.div`
  background: ${props => props.active ? '#4CAF50' : '#2196F3'};
  padding: 20px;
  border-radius: 10px;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  }
`;

const MessageArea = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 800px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  display: ${props => props.visible ? 'block' : 'none'};
`;

const VoiceControls = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const Button = styled.button`
  background: ${props => props.isListening ? '#ff4444' : '#4CAF50'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const StatusText = styled.div`
  margin-top: 10px;
  font-style: italic;
  color: #666;
`;

const MessageHistory = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  color: #000;
`;

const Message = styled.div`
  margin: 10px 0;
  padding: 8px;
  border-radius: 5px;
  background: ${props => props.isUser ? '#e3f2fd' : '#f5f5f5'};
`;

function App() {
  const [conversations, setConversations] = useState(() => {
    return [
      { id: 1, topic: "Travel Planning" },
      { id: 2, topic: "Recipe Ideas" },
      { id: 3, topic: "Tech Support" },
      { id: 4, topic: "Language Learning" },
      { id: 5, topic: "Fitness Advice" },
      { id: 6, topic: "Book Recommendations" },
      { id: 7, topic: "Career Guidance" },
      { id: 8, topic: "Mental Wellness" },
      { id: 9, topic: "Home Improvement" },
      { id: 10, topic: "Financial Planning" }
    ].map(conv => new Conversation(conv.id, conv.topic));
  });

  const [activeConversation, setActiveConversation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('');
  
  const openAIService = new OpenAIService();
  const voiceService = new VoiceService();

  const handleVoiceInput = async () => {
    if (!activeConversation) return;
    
    try {
      setIsListening(true);
      setStatus('Listening...');
      const transcript = await voiceService.startListening();
      setStatus('Processing your message...');
      
      const currentConv = conversations.find(conv => conv.id === activeConversation);
      currentConv.addMessage('user', transcript);
      
      const aiResponse = await openAIService.sendMessage(
        transcript,
        currentConv.topic,
        currentConv.getContext()
      );
      
      currentConv.addMessage('assistant', aiResponse);
      setConversations([...conversations]); // Trigger re-render
      
      setStatus('Speaking...');
      await voiceService.speak(aiResponse);
      setStatus('');
    } catch (error) {
      console.error('Voice interaction error:', error);
      setStatus('Error: Could not process voice input');
    } finally {
      setIsListening(false);
    }
  };

  const stopVoiceInteraction = () => {
    voiceService.stopListening();
    voiceService.cancel();
    setIsListening(false);
    setStatus('');
  };

  const handleTileClick = async (id) => {
    if (activeConversation === id) {
      setActiveConversation(null);
      stopVoiceInteraction();
    } else {
      setActiveConversation(id);
      setIsProcessing(true);
      
      try {
        const currentConv = conversations.find(conv => conv.id === id);
        
        if (currentConv.messages.length === 0) {
          const message = `Let's start a conversation about ${currentConv.topic}. What would you like to know?`;
          const aiResponse = await openAIService.sendMessage(message, currentConv.topic);
          currentConv.addMessage('assistant', aiResponse);
          setConversations([...conversations]); // Trigger re-render
          await voiceService.speak(aiResponse);
        }
      } catch (error) {
        setStatus('Sorry, there was an error connecting to the service.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === activeConversation);
  };

  useEffect(() => {
    return () => {
      stopVoiceInteraction();
    };
  }, []);

  return (
    <>
      <Grid>
        {conversations.map(conv => (
          <Tile 
            key={conv.id}
            active={activeConversation === conv.id}
            onClick={() => handleTileClick(conv.id)}
          >
            {conv.topic}
            {conv.messages.length > 0 && (
              <small style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                ({conv.messages.length} messages)
              </small>
            )}
          </Tile>
        ))}
      </Grid>
      <MessageArea visible={activeConversation !== null}>
        <MessageHistory>
          {getCurrentConversation()?.messages.map((msg, index) => (
            <Message key={index} isUser={msg.role === 'user'}>
              <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong> {msg.content}
            </Message>
          ))}
        
        </MessageHistory>
        <VoiceControls>
          <Button
            onClick={isListening ? stopVoiceInteraction : handleVoiceInput}
            isListening={isListening}
            disabled={!activeConversation || isProcessing}
          >
            {isListening ? 'Stop' : 'Start Speaking'}
          </Button>
        </VoiceControls>
        {status && <StatusText>{status}</StatusText>}
      </MessageArea>
    </>
  );
}

export default App;
