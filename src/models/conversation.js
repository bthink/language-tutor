export class Conversation {
  constructor(id, topic) {
    this.id = id;
    this.topic = topic;
    this.messages = [];
    this.isActive = false;
  }

  addMessage(role, content) {
    this.messages.push({ role, content, timestamp: new Date() });
  }

  getMessages() {
    return this.messages;
  }

  getContext() {
    return this.messages.map(({ role, content }) => ({ role, content }));
  }

  clear() {
    this.messages = [];
  }
} 