import ChatBot from './chatbot/chatbot.js';
import Conversational from './chatbot/conversational.js';

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Show collected data
function showCollectedData() {
  const data = window.chatbot.conversational.getCollectedData();
  if (Object.keys(data).length === 0) {
    window.chatbot.postMessage({
      type: 'text',
      content: '📊 No form data collected yet.',
    });
  } else {
    window.chatbot.postMessage({
      type: 'text',
      content: `📊 **Collected Data:**\n\n${Object.entries(data).map(([key, value]) => `• ${key}: ${value}`).join('\n')}`,
    });
  }
}

// Show progress
function showProgress() {
  const progress = window.chatbot.conversational.getProgress();
  window.chatbot.postMessage({
    type: 'text',
    content: `📈 **Progress:** ${progress.current}/${progress.total} fields completed (${progress.percentage}%)`,
  });
}

// Show history
function showHistory() {
  const history = window.chatbot.conversational.getConversationHistory();
  window.chatbot.postMessage({
    type: 'text',
    content: `📋 **Conversation History:** ${history.length} messages exchanged`,
  });
}

// Export data
function exportData() {
  const data = window.chatbot.conversational.getCollectedData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'form-data.json';
  a.click();
  URL.revokeObjectURL(url);
  window.chatbot.postMessage({
    type: 'text',
    content: '💾 Form data exported as JSON file!',
  });
}

// Reset form
function resetForm() {
  window.chatbot.conversational.reset();
  window.chatbot.postMessage({
    type: 'text',
    content: '🔄 Form data and conversation reset!',
  });
}

// Clear chat
function clearChat() {
  window.chatbot.clearMessages();
}

// Show welcome message
function showWelcomeMessage() {
  setTimeout(() => {
    window.chatbot.postMessage({
      type: 'text',
      content: '👋 Welcome to Conversational Forms! Try the examples or start a form conversation.',
    });
  }, 1000);
}

// Handle action buttons
function handleAction(action) {
  if (!window.chatbot || !window.chatbot.conversational) {
    showToast('Please start a conversation first', 'error');
    return;
  }

  switch (action) {
    case 'showData':
      showCollectedData();
      break;
    case 'showProgress':
      showProgress();
      break;
    case 'showHistory':
      showHistory();
      break;
    case 'exportData':
      exportData();
      break;
    case 'resetForm':
      resetForm();
      break;
    case 'clearChat':
      clearChat();
      break;
    default:
      showToast('Unknown action', 'error');
      break;
  }
}

// Post example message
function postExampleMessage(example) {
  if (!window.chatbot) {
    initializeChatbot();
  }

  const message = {
    type: example.type,
    content: example.content,
  };

  if (example.data) {
    if (example.type === 'boolean') {
      message.boolean = example.data;
    } else if (example.type === 'choice') {
      message.choices = example.data;
    } else if (example.type === 'field') {
      message.field = example.data;
    }
  }

  window.chatbot.postMessage(message);
}

// Start conversation with form URL
function startConversation(url) {
  window.chatbot.clearMessages();
  window.chatbot.postMessage({
    type: 'system',
    content: '🚀 Starting conversational form experience...',
  });

  window.chatbot.startConversationalForm(url);
}

// Create URL input section
function createUrlSection() {
  const urlSection = document.createElement('div');
  urlSection.className = 'url-section';

  const urlLabel = document.createElement('label');
  urlLabel.textContent = 'Form URL:';
  urlLabel.htmlFor = 'form-url-input';

  const urlInput = document.createElement('input');
  urlInput.type = 'url';
  urlInput.id = 'form-url-input';
  urlInput.placeholder = 'https://example.com/form';
  urlInput.value = 'https://www.securbankdemo.com/accounts';

  const startButton = document.createElement('button');
  startButton.textContent = '🚀 Start Conversation';
  startButton.className = 'start-button';

  startButton.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (!url) {
      showToast('Please enter a form URL', 'error');
      return;
    }
    startConversation(url);
  });

  urlSection.appendChild(urlLabel);
  urlSection.appendChild(urlInput);
  urlSection.appendChild(startButton);

  return urlSection;
}

// Create examples section
function createExamplesSection() {
  const examplesSection = document.createElement('div');
  examplesSection.className = 'examples-section';

  const examplesTitle = document.createElement('h3');
  examplesTitle.textContent = '💡 Widget Examples';

  const examplesGrid = document.createElement('div');
  examplesGrid.className = 'examples-grid';

  const examples = [
    { text: '📝 Text Message', type: 'text', content: 'Hello! This is a simple text message example.' },
    { text: '✅ Yes/No Choice', type: 'boolean', content: 'Do you agree to the terms?', data: { name: 'agreement', trueLabel: 'Yes', falseLabel: 'No' } },
    { text: '📋 Multiple Choice', type: 'choice', content: 'What are your interests?', data: { options: ['Technology', 'Design', 'Marketing', 'Sports'] } },
    { text: '📅 Date Picker', type: 'field', content: 'When is your birthday?', data: { type: 'date', name: 'birthday' } },
    { text: '📎 File Upload', type: 'field', content: 'Upload your resume:', data: { type: 'file', name: 'resume', accept: '.pdf,.doc' } },
    { text: '📧 Email Field', type: 'field', content: 'What is your email?', data: { type: 'email', name: 'email' } },
    { text: '📞 Phone Field', type: 'field', content: 'What is your phone number?', data: { type: 'tel', name: 'phone' } },
    { text: '🔢 Number Field', type: 'field', content: 'How old are you?', data: { type: 'number', name: 'age' } },
  ];

  examples.forEach((example) => {
    const button = document.createElement('button');
    button.textContent = example.text;
    button.className = 'example-button';
    button.addEventListener('click', () => postExampleMessage(example));
    examplesGrid.appendChild(button);
  });

  examplesSection.appendChild(examplesTitle);
  examplesSection.appendChild(examplesGrid);

  return examplesSection;
}

// Create actions section
function createActionsSection() {
  const actionsSection = document.createElement('div');
  actionsSection.className = 'actions-section';

  const actionsTitle = document.createElement('h3');
  actionsTitle.textContent = '🛠️ Actions';

  const actionsGrid = document.createElement('div');
  actionsGrid.className = 'actions-grid';

  const actions = [
    { text: '📊 Show Data', action: 'showData' },
    { text: '📈 Show Progress', action: 'showProgress' },
    { text: '📋 Show History', action: 'showHistory' },
    { text: '💾 Export Data', action: 'exportData' },
    { text: '🔄 Reset Form', action: 'resetForm' },
    { text: '🗑️ Clear Chat', action: 'clearChat' },
  ];

  actions.forEach((action) => {
    const button = document.createElement('button');
    button.textContent = action.text;
    button.className = 'action-button';
    button.addEventListener('click', () => handleAction(action.action));
    actionsGrid.appendChild(button);
  });

  actionsSection.appendChild(actionsTitle);
  actionsSection.appendChild(actionsGrid);

  return actionsSection;
}

// Build complete UI
function buildUI() {
  const container = document.createElement('div');
  container.className = 'conversational-ui';

  container.appendChild(createUrlSection());
  container.appendChild(createExamplesSection());
  container.appendChild(createActionsSection());

  return container;
}

// Main decorator function
export default function decorate(block) {
  // Create anchor for chatbot
  const a = document.createElement('a');
  a.href = 'https://www.securbankdemo.com/accounts';
  a.textContent = 'Start Conversational Form';
  block.appendChild(a);

  // Create chatbot block
  const chatbotBlock = document.createElement('div');
  chatbotBlock.className = 'chatbot-block';
  chatbotBlock.appendChild(a);
  // Build UI
  const ui = buildUI();

  // Clear block and add UI
  block.innerHTML = '';
  block.appendChild(ui);
  block.appendChild(chatbotBlock);

  // Initialize chatbot
  const chatbot = new ChatBot(chatbotBlock);

  return block;
}
