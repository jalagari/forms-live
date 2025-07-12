# Conversational UI Form Component

A ChatGPT-style conversational interface for building forms with real-time markdown output. This component provides a two-column layout with an AI assistant chatbot on the left and an editable markdown display on the right.

## Features

### 🤖 Chatbot Interface (Left Column)
- **Conversational UI**: Interactive chat interface similar to ChatGPT
- **File Upload Support**: Drag & drop or click to upload images, PDFs, and documents
- **Message Threading**: User messages appear on the right, assistant responses on the left
- **Typing Indicators**: Animated loading state while processing responses
- **Keyboard Shortcuts**: Cmd/Ctrl + Enter to send messages
- **Responsive Design**: Adapts to different screen sizes

### 📝 Markdown Editor (Right Column)
- **Live Preview**: Real-time display of generated markdown
- **Edit Mode**: Switch between preview and editing modes
- **Auto-Save**: Save markdown content to the server
- **Syntax Highlighting**: Monospace font for code readability
- **Responsive Layout**: Stacks vertically on mobile devices

### 🎨 Design Features
- **Modern UI**: Clean, professional design with subtle animations
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **File Management**: Visual file selection with remove options
- **Smooth Transitions**: Fade-in animations for new messages
- **Custom Scrollbars**: Styled scrollbars for better UX

## Usage

### Basic Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Builder</title>
</head>
<body>
    <da-form></da-form>
    
    <script type="module" src="./deps/lit/dist/index.js"></script>
    <script type="module" src="./blocks/form/form.js"></script>
</body>
</html>
```

### Integration with Existing Projects

```javascript
// Import the component
import './blocks/form/form.js';

// Use in your HTML
<da-form></da-form>
```

## API Integration

The component is designed to be easily integrated with AI services. Replace the `simulateAIResponse` method with your actual API calls:

```javascript
// Example integration with OpenAI
async simulateAIResponse(userMessage) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: userMessage.text,
      files: userMessage.files,
    }),
  });
  
  const data = await response.json();
  
  const aiResponse = {
    text: data.response,
    timestamp: new Date().toISOString(),
    type: 'assistant',
  };
  
  this._messages = [...this._messages, aiResponse];
  this._markdown = data.markdown; // Update markdown if provided
}
```

## File Upload Support

The component supports various file types:

- **Images**: JPG, PNG, GIF, SVG
- **Documents**: PDF, TXT, MD, JSON
- **Multiple Files**: Drag & drop or select multiple files
- **File Display**: Shows file names and sizes in messages

## Customization

### Styling

The component uses CSS custom properties for easy theming:

```css
da-form {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --background-color: #f8f9fa;
  --border-radius: 8px;
}
```

### Message Handling

Extend the component to add custom message types:

```javascript
class CustomDaForm extends DaForm {
  renderMessage(message) {
    if (message.type === 'system') {
      return html`
        <div class="message system-message">
          <div class="message-content">
            <div class="message-text">${message.text}</div>
          </div>
        </div>
      `;
    }
    return super.renderMessage(message);
  }
}
```

## Browser Support

- **Modern Browsers**: Chrome 63+, Firefox 63+, Safari 11+, Edge 79+
- **ES Modules**: Required for component imports
- **Web Components**: Uses Lit framework for component structure
- **CSS Grid/Flexbox**: For responsive layout

## Development

### Prerequisites

- Node.js 16+ and npm
- Modern browser with ES modules support

### Building

```bash
# Install dependencies
npm install

# Build the component
npm run build:da-lit

# Run tests
npm test

# Lint code
npm run lint
```

### File Structure

```
blocks/form/
├── form.js           # Main component logic
├── form.css          # Styling
├── README.md         # Documentation
└── demo.html         # Demo page
```

## Examples

### Basic Form Generation

User: "Create a contact form with name, email, and message fields"

The assistant will:
1. Generate appropriate form HTML
2. Update the markdown with form structure
3. Provide styling suggestions
4. Add validation rules

### File Analysis

User: Uploads a form wireframe image

The assistant will:
1. Analyze the image content
2. Extract form requirements
3. Generate corresponding HTML/CSS
4. Provide implementation guidance

## Accessibility

The component follows WCAG 2.1 guidelines:

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Logical tab order
- **Color Contrast**: Meets AA standards
- **Responsive Design**: Works on all device sizes

## Performance

- **Lazy Loading**: Components load only when needed
- **Efficient Rendering**: Uses Lit's efficient update system
- **Memory Management**: Proper cleanup of event listeners
- **File Handling**: Optimized file upload processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the documentation for common solutions
- Review the demo page for implementation examples 