export class VoiceService {
  constructor() {
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.synthesis = window.speechSynthesis;
    this.setupRecognition();
  }

  setupRecognition() {
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
  }

  startListening() {
    return new Promise((resolve, reject) => {
      try {
        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          resolve(transcript);
        };

        this.recognition.onerror = (event) => {
          reject(event.error);
        };

        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  stopListening() {
    this.recognition.stop();
  }

  speak(text) {
    console.log('speaking', text);
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      this.synthesis.speak(utterance);
    });
  }

  cancel() {
    this.synthesis.cancel();
  }
} 