import { LitElement, html, nothing } from 'da-lit';
import { saveToDa } from '../shared/utils.js';
import getSheet from '../shared/sheet.js';

const sheet = await getSheet('/blocks/form/form.css');

export default class DaForm extends LitElement {
  static properties = {
    _messages: { state: true },
    _currentMessage: { state: true },
    _isLoading: { state: true },
    _markdown: { state: true },
    _isEditingMarkdown: { state: true },
    _dragActive: { state: true },
    _selectedFiles: { state: true },
  };

  constructor() {
    super();
    this._messages = [];
    this._currentMessage = '';
    this._isLoading = false;
    this._markdown = '# Welcome to Form Builder\n\nStart a conversation to build your form...';
    this._isEditingMarkdown = false;
    this._dragActive = false;
    this._selectedFiles = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.adoptedStyleSheets = [sheet];
  }

  // Handle text input changes
  handleInputChange(e) {
    this._currentMessage = e.target.value;
  }

  // Handle file selection
  handleFileSelect(e) {
    const files = Array.from(e.target.files);
    this._selectedFiles = [...this._selectedFiles, ...files];
    this.requestUpdate();
  }

  // Remove selected file
  removeFile(index) {
    this._selectedFiles = this._selectedFiles.filter((_, i) => i !== index);
    this.requestUpdate();
  }

  // Handle drag and drop
  handleDragOver(e) {
    e.preventDefault();
    this._dragActive = true;
  }

  handleDragLeave(e) {
    e.preventDefault();
    this._dragActive = false;
  }

  handleDrop(e) {
    e.preventDefault();
    this._dragActive = false;
    const files = Array.from(e.dataTransfer.files);
    this._selectedFiles = [...this._selectedFiles, ...files];
    this.requestUpdate();
  }

  // Send message
  async handleSendMessage(e) {
    e.preventDefault();
    if (!this._currentMessage.trim() && this._selectedFiles.length === 0) return;

    const messageData = {
      text: this._currentMessage,
      files: this._selectedFiles,
      timestamp: new Date().toISOString(),
      type: 'user',
    };

    this._messages = [...this._messages, messageData];
    this._currentMessage = '';
    this._selectedFiles = [];
    this._isLoading = true;

    // Simulate AI response (replace with actual API call)
    await this.simulateAIResponse(messageData);

    this._isLoading = false;
    this.requestUpdate();
  }

  // Simulate AI response (replace with actual API integration)
  async simulateAIResponse(userMessage) {
    // Simulate processing delay
    await new Promise((resolve) => {
      setTimeout(resolve, 1000 + Math.random() * 2000);
    });

    let responseText = '';

    if (userMessage.text.toLowerCase().includes('form')) {
      responseText = `I'll help you create a form! Based on your request "${userMessage.text}", I suggest we start with:

1. **Form Structure**: What type of form are you building?
2. **Input Fields**: What information do you need to collect?
3. **Validation**: What validation rules should we apply?
4. **Styling**: Any specific design preferences?

Let me update the markdown with a basic form structure to get us started.`;

      this._markdown = `# Form Builder - ${new Date().toLocaleDateString()}

## Form Configuration

### Basic Structure
- **Form Type**: Contact Form
- **Fields**: Name, Email, Message
- **Validation**: Required fields, email format

### Generated Form Code

\`\`\`html
<form class="da-form">
  <div class="form-group">
    <label for="name">Name *</label>
    <input type="text" id="name" name="name" required>
  </div>
  
  <div class="form-group">
    <label for="email">Email *</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" name="message" rows="4"></textarea>
  </div>
  
  <button type="submit">Send Message</button>
</form>
\`\`\`

### Styling
- Modern, clean design
- Responsive layout
- Accessible form elements
- Validation feedback
`;
    } else if (userMessage.files.length > 0) {
      responseText = `I can see you've uploaded ${userMessage.files.length} file(s). I can help you:

1. **Analyze images** to understand form requirements
2. **Extract text** from PDFs or screenshots
3. **Generate forms** based on document content
4. **Create validation rules** from specifications

What would you like me to do with these files?`;
    } else {
      responseText = `I understand you're saying: "${userMessage.text}"

As a form building assistant, I can help you with:
- Creating custom forms
- Adding validation rules
- Styling and layout
- Integration with backends
- Accessibility features

What specific form functionality would you like to build?`;
    }

    const aiResponse = {
      text: responseText,
      timestamp: new Date().toISOString(),
      type: 'assistant',
    };

    this._messages = [...this._messages, aiResponse];
  }

  // Handle keyboard shortcuts
  handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      this.handleSendMessage(e);
    }
  }

  // Toggle markdown editing
  toggleMarkdownEdit() {
    this._isEditingMarkdown = !this._isEditingMarkdown;
  }

  // Handle markdown changes
  handleMarkdownChange(e) {
    this._markdown = e.target.value;
  }

  // Save markdown
  async saveMarkdown() {
    try {
      const blob = new Blob([this._markdown], { type: 'text/markdown' });
      await saveToDa({
        path: '/form-builder-output.md',
        blob,
        preview: false,
      });
      this._isEditingMarkdown = false;
      // Show success message
      console.log('Markdown saved successfully');
    } catch (error) {
      console.error('Error saving markdown:', error);
    }
  }

  // Render message
  renderMessage(message) {
    const isUser = message.type === 'user';
    return html`
      <div class="message ${isUser ? 'user-message' : 'assistant-message'}">
        <div class="message-content">
          <div class="message-text">${message.text}</div>
          ${message.files && message.files.length > 0 ? html`
            <div class="message-files">
              ${message.files.map((file) => html`
                <div class="file-item">
                  <span class="file-name">${file.name}</span>
                  <span class="file-size">(${this.formatFileSize(file.size)})</span>
                </div>
              `)}
            </div>
          ` : nothing}
        </div>
        <div class="message-timestamp">${this.formatTimestamp(message.timestamp)}</div>
      </div>
    `;
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / (k ** i)).toFixed(2))} ${sizes[i]}`;
  }

  // Format timestamp
  formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString();
  }

  render() {
    return html`
      <div class="da-form-container">
        <!-- Left Column: Chatbot -->
        <div class="chatbot-column">
          <div class="chatbot-header">
            <h2>Form Builder Assistant</h2>
            <p>Describe your form requirements or upload files</p>
          </div>
          
          <div class="messages-container">
            ${this._messages.map((message) => this.renderMessage(message))}
            ${this._isLoading ? html`
              <div class="message assistant-message loading">
                <div class="message-content">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            ` : nothing}
          </div>

          <div class="input-container">
            <!-- File Upload Area -->
            <div class="file-upload-area ${this._dragActive ? 'drag-active' : ''}"
                 @dragover=${this.handleDragOver}
                 @dragleave=${this.handleDragLeave}
                 @drop=${this.handleDrop}>
              
              ${this._selectedFiles.length > 0 ? html`
                <div class="selected-files">
                  ${this._selectedFiles.map((file, index) => html`
                    <div class="selected-file">
                      <span class="file-name">${file.name}</span>
                      <button class="remove-file" @click=${() => this.removeFile(index)}>×</button>
                    </div>
                  `)}
                </div>
              ` : nothing}
              
              <input type="file" 
                     id="file-input" 
                     class="file-input"
                     multiple
                     accept="image/*,.pdf,.txt,.md,.json"
                     @change=${this.handleFileSelect}>
              
              <label for="file-input" class="file-upload-label">
                <svg viewBox="0 0 24 24" class="upload-icon">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                Drop files here or click to upload
              </label>
            </div>

            <!-- Message Input -->
            <form class="message-form" @submit=${this.handleSendMessage}>
              <textarea 
                class="message-input"
                placeholder="Describe your form requirements..."
                .value=${this._currentMessage}
                @input=${this.handleInputChange}
                @keydown=${this.handleKeyDown}
                rows="3"></textarea>
              
              <button type="submit" 
                      class="send-button"
                      ?disabled=${!this._currentMessage.trim() && this._selectedFiles.length === 0}>
                <svg viewBox="0 0 24 24" class="send-icon">
                  <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                </svg>
                Send
              </button>
            </form>
          </div>
        </div>

        <!-- Right Column: Markdown Editor -->
        <div class="markdown-column">
          <div class="markdown-header">
            <h2>Form Output</h2>
            <div class="markdown-actions">
              <button class="markdown-action" @click=${this.toggleMarkdownEdit}>
                ${this._isEditingMarkdown ? 'Preview' : 'Edit'}
              </button>
              ${this._isEditingMarkdown ? html`
                <button class="markdown-action primary" @click=${this.saveMarkdown}>
                  Save
                </button>
              ` : nothing}
            </div>
          </div>

          <div class="markdown-content">
            ${this._isEditingMarkdown ? html`
              <textarea 
                class="markdown-editor"
                .value=${this._markdown}
                @input=${this.handleMarkdownChange}
                placeholder="Enter markdown content..."></textarea>
            ` : html`
              <div class="markdown-preview">
                <pre class="markdown-text">${this._markdown}</pre>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('da-form', DaForm);
