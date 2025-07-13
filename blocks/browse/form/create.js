import { LitElement, html } from 'da-lit';
import formsService from './services/service.js';
import { getNx } from '../../../scripts/utils.js';

// Styles
const { default: getStyle } = await import(`${getNx()}/utils/styles.js`);
const STYLE = await getStyle(import.meta.url);

class CreateForm extends LitElement {
  static properties = {
    existingForms: { type: Array },
    creationMethod: { type: String },
    detailLevel: { type: String },
    uploadedFileUrl: { type: String },
    isUploading: { type: Boolean },
    isCreatingForm: { type: Boolean },
    onFormCreate: { attribute: false },
    _isOpen: { type: Boolean },
  };

  constructor() {
    super();
    this.existingForms = [];
    this.creationMethod = 'prompt'; // default to prompt method
    this.detailLevel = 'STANDARD'; // default detail level
    this.uploadedFileUrl = null;
    this.isUploading = false;
    this.isCreatingForm = false;
    this._isOpen = false;
    this.formPath = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.adoptedStyleSheets = [STYLE];
  }

  // Show the dialog
  show(formPath) {
    this._isOpen = true;
    this.formPath = formPath;
    this.requestUpdate();
  }

  // Hide the dialog
  hide() {
    this._isOpen = false;
    this.requestUpdate();
  }

  // Show error toast
  showErrorToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 1001;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;

    // Add to document body
    document.body.appendChild(toast);

    // Auto-remove after timeout
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 6000);
  }

  // Handle creation method selection
  handleCreationMethodChange(event) {
    this.creationMethod = event.target.value;
    // Clear uploaded file when switching methods
    this.uploadedFileUrl = null;
    this.isUploading = false;
    this.isCreatingForm = false;
    // Reset detail level to default when switching methods
    this.detailLevel = 'STANDARD';
    this.updateDetailLevelDisplay();
    console.log('Creation method changed to:', this.creationMethod);
  }

  // Handle detail level selection
  handleDetailLevelChange(event) {
    this.detailLevel = event.target.value;
    this.updateDetailLevelDisplay();
    console.log('Detail level changed to:', this.detailLevel);
  }

  // Update detail level display
  updateDetailLevelDisplay() {
    const detailOptions = this.shadowRoot.querySelectorAll('.detail-option');
    detailOptions.forEach((option) => {
      const radio = option.querySelector('input[type="radio"]');
      if (radio && radio.value === this.detailLevel) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  }

  validatePrompt(prompt) {
    if (!prompt || prompt.trim().length < 10) {
      return { valid: false, message: 'Please provide a more detailed description (at least 10 characters)' };
    }
    return { valid: true };
  }

  validateUrl(url) {
    if (!url || url.trim().length === 0) {
      return { valid: false, message: 'Please enter a URL' };
    }
    if (!this.isValidUrl(url.trim())) {
      return { valid: false, message: 'Please enter a valid URL' };
    }
    return { valid: true };
  }

  // Handle image upload button click
  handleImageUploadClick() {
    const imageInput = this.shadowRoot.querySelector('#imageInput');
    if (imageInput) {
      imageInput.click();
    }
  }

  // Handle image remove button click
  handleImageRemove() {
    const imageInput = this.shadowRoot.querySelector('#imageInput');
    if (imageInput) {
      imageInput.value = '';
      this.uploadedFileUrl = null;
      this.isUploading = false;
      this.updateImagePreview();
    }
  }

  // Validate and upload image
  async handleImageInput(event) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.showErrorToast('Please upload an image file (JPEG, PNG, GIF) or PDF');
        event.target.value = '';
        return;
      } if (file.size > 10 * 1024 * 1024) { // 10MB limit
        this.showErrorToast('File size should be less than 10MB');
        event.target.value = '';
        return;
      }

      // Start upload process
      this.isUploading = true;
      this.updateImagePreview();

      try {
        this.uploadedFileUrl = await formsService.uploadFile(file);
        console.log('File uploaded successfully:', this.uploadedFileUrl);
      } catch (error) {
        console.error('Upload failed:', error);
        this.showErrorToast('Failed to upload file. Please try again.');
        this.uploadedFileUrl = null;
        event.target.value = '';
      } finally {
        this.isUploading = false;
        this.updateImagePreview();
      }
    } else {
      this.uploadedFileUrl = null;
    }
    this.updateImagePreview();
  }

  // Update form creation state
  updateFormCreationState() {
    const confirmButton = this.shadowRoot.querySelector('.dialog-confirm-btn');
    const cancelButton = this.shadowRoot.querySelector('.dialog-cancel-btn');

    if (this.isCreatingForm) {
      if (confirmButton) {
        confirmButton.disabled = true;
        confirmButton.textContent = 'Creating Form...';
      }
      if (cancelButton) {
        cancelButton.disabled = true;
      }
    } else {
      if (confirmButton) {
        confirmButton.disabled = false;
        confirmButton.textContent = 'Create Form';
      }
      if (cancelButton) {
        cancelButton.disabled = false;
      }
    }
  }

  // Update image preview
  updateImagePreview() {
    const imageInput = this.shadowRoot.querySelector('#imageInput');
    const uploadedFiles = this.shadowRoot.querySelector('.uploaded-files');
    const fileName = uploadedFiles?.querySelector('.file-name');
    const uploadProgress = this.shadowRoot.querySelector('.upload-progress');
    const dropzone = this.shadowRoot.querySelector('.file-upload-dropzone');

    if (imageInput && imageInput.files[0]) {
      const file = imageInput.files[0];

      if (this.isUploading) {
        if (fileName) fileName.innerHTML = `<span class="upload-status">📤 Uploading ${file.name}...</span>`;
        if (uploadedFiles) uploadedFiles.style.display = 'block';
        if (uploadProgress) uploadProgress.style.display = 'flex';
        if (dropzone) dropzone.classList.add('uploading');
      } else if (this.uploadedFileUrl) {
        if (fileName) fileName.innerHTML = `<span class="upload-status success">✅ ${file.name} uploaded successfully</span>`;
        if (uploadedFiles) uploadedFiles.style.display = 'block';
        if (uploadProgress) uploadProgress.style.display = 'none';
        if (dropzone) {
          dropzone.classList.remove('uploading');
          dropzone.classList.add('uploaded');
        }
      } else {
        if (fileName) fileName.innerHTML = `<span class="upload-status error">❌ ${file.name} - Upload failed</span>`;
        if (uploadedFiles) uploadedFiles.style.display = 'block';
        if (uploadProgress) uploadProgress.style.display = 'none';
        if (dropzone) dropzone.classList.remove('uploading', 'uploaded');
      }
    } else {
      if (uploadedFiles) uploadedFiles.style.display = 'none';
      if (uploadProgress) uploadProgress.style.display = 'none';
      if (dropzone) dropzone.classList.remove('uploading', 'uploaded');
    }
  }

  // Helper method to validate URL
  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  // Update form inputs visibility
  updateFormInputs() {
    const promptSection = this.shadowRoot.querySelector('.prompt-section');
    const imageSection = this.shadowRoot.querySelector('.image-section');
    const urlSection = this.shadowRoot.querySelector('.url-section');

    if (promptSection) promptSection.style.display = this.creationMethod === 'prompt' ? 'block' : 'none';
    if (imageSection) imageSection.style.display = this.creationMethod === 'image' ? 'block' : 'none';
    if (urlSection) urlSection.style.display = this.creationMethod === 'url' ? 'block' : 'none';

    // Update selected state
    this.shadowRoot.querySelectorAll('.method-option').forEach((option) => {
      const radio = option.querySelector('input[type="radio"]');
      if (radio && radio.value === this.creationMethod) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  }

  // Dialog event handlers
  async handleDialogConfirm(event) {
    event.preventDefault(); // Always prevent default form submission

    const formNameInput = this.shadowRoot.querySelector('#formName');
    const formName = formNameInput.value.trim();

    // Prevent submission while uploading or creating form
    if (this.isUploading) {
      this.showErrorToast('Please wait for the file upload to complete');
      return;
    }

    if (this.isCreatingForm) {
      return;
    }

    // Validate form name
    if (!formName) {
      this.showErrorToast('Please enter a form name');
      return;
    }

    // Validate creation method specific inputs
    if (this.creationMethod === 'prompt') {
      const promptInput = this.shadowRoot.querySelector('#promptInput');
      const prompt = promptInput.value.trim();
      const promptValidation = this.validatePrompt(prompt);
      if (!promptValidation.valid) {
        this.showErrorToast(promptValidation.message);
        return;
      }
    } else if (this.creationMethod === 'image') {
      const imageInput = this.shadowRoot.querySelector('#imageInput');

      if (!imageInput.files[0]) {
        this.showErrorToast('Please select an image or PDF file');
        return;
      } if (!this.uploadedFileUrl) {
        this.showErrorToast('Please wait for the file to upload or try uploading again');
        return;
      }
    } else if (this.creationMethod === 'url') {
      const urlInput = this.shadowRoot.querySelector('#urlInput');
      const url = urlInput.value.trim();
      const urlValidation = this.validateUrl(url);
      if (!urlValidation.valid) {
        this.showErrorToast(urlValidation.message);
        return;
      }
    }

    // Collect form data based on creation method
    const formData = {
      formName,
      prompt: this.shadowRoot.querySelector('#promptInput').value.trim(),
      fileUrl: this.uploadedFileUrl,
      url: this.shadowRoot.querySelector('#urlInput').value.trim(),
      detailLevel: this.detailLevel,
      formPath: this.formPath,
    };

    // Dispatch event to parent component
    if (this.onFormCreate) {
      this.onFormCreate(formData);
    }

    // Call the form creation API
    this.isCreatingForm = true;
    this.updateFormCreationState();

    try {
      await formsService.createForm(formData);

      // Handle successful creation - redirect to edit page
      const editUrl = `/edit#${this.formPath}/${encodeURIComponent(formData.formName)}`;
      console.log('Form created successfully, opening in new tab:', editUrl);
      window.open(`${editUrl}/brief`, '_blank');
      window.open(`${editUrl}/form`.replace('edit', 'sheet'), '_blank');
      window.open(`${editUrl}`, '_blank');
    } catch (error) {
      console.error('Form creation failed:', error);
      // Show error using spectrum toast
      const errorMessage = formsService.handleApiError(error, 'create form');
      this.showErrorToast(errorMessage);
    } finally {
      this.isCreatingForm = false;
      this.updateFormCreationState();
    }
  }

  handleDialogCancel() {
    // Reset form state when dialog is cancelled
    this.creationMethod = 'prompt';
    this.detailLevel = 'STANDARD';
    this.uploadedFileUrl = null;
    this.isUploading = false;
    this.isCreatingForm = false;
    this.hide();
    console.log('Create form dialog cancelled');
  }

  render() {
    if (!this._isOpen) {
      return html``;
    }

    return html`
      <div class="modal-overlay" @click=${this.handleDialogCancel}>
        <div class="modal-content" @click=${(e) => e.stopPropagation()}>
          <div class="dialog-header">
            <h2 class="dialog-title">Create New Adaptive Form</h2>
            <button class="dialog-close-btn" @click=${this.handleDialogCancel}>×</button>
          </div>
          
          <div class="dialog-body">
            <div class="form-section">
              <label for="formName" class="form-label required">Form Name</label>
              <input 
                type="text"
                id="formName" 
                name="formName" 
                class="form-input"
                placeholder="Enter form name (letters only)..." 
                pattern="[a-zA-Z\\s]+"
                title="Only letters and spaces are allowed"
                required 
              />
              <div class="form-help-text">
                Use only letters and spaces (e.g., "Contact Form", "User Survey")
              </div>
            </div>

            <div class="form-section">
              <label class="form-label">How would you like to create your form?</label>
              <div class="creation-method-options">
                <label class="method-option ${this.creationMethod === 'prompt' ? 'selected' : ''}">
                  <input type="radio" name="creationMethod" value="prompt" ?checked=${this.creationMethod === 'prompt'} @change=${this.handleCreationMethodChange}>
                  <div class="method-content">
                    <strong>Describe Your Requirements</strong>
                    <div class="method-description">Tell us what kind of form you need in plain English</div>
                  </div>
                </label>
                
                <label class="method-option ${this.creationMethod === 'image' ? 'selected' : ''}">
                  <input type="radio" name="creationMethod" value="image" ?checked=${this.creationMethod === 'image'} @change=${this.handleCreationMethodChange}>
                  <div class="method-content">
                    <strong>Upload Form Image/PDF</strong>
                    <div class="method-description">Upload an image or PDF of an existing form to recreate</div>
                  </div>
                </label>
                
                <label class="method-option ${this.creationMethod === 'url' ? 'selected' : ''}">
                  <input type="radio" name="creationMethod" value="url" ?checked=${this.creationMethod === 'url'} @change=${this.handleCreationMethodChange}>
                  <div class="method-content">
                    <strong>Existing Form URL</strong>
                    <div class="method-description">Provide a URL to an existing form that you'd like to recreate</div>
                  </div>
                </label>
              </div>
            </div>

            <div class="creation-inputs-section">
              <div class="prompt-section" style="display: ${this.creationMethod === 'prompt' ? 'block' : 'none'};">
                <div class="detail-level-section">
                  <label class="form-label">Detail Level</label>
                  <div class="detail-level-options">
                    <label class="detail-option ${this.detailLevel === 'SIMPLE' ? 'selected' : ''}">
                      <input type="radio" name="detailLevel" value="SIMPLE" ?checked=${this.detailLevel === 'SIMPLE'} @change=${this.handleDetailLevelChange}>
                      <div class="detail-content">
                        <strong>Simple</strong>
                      </div>
                    </label>
                    
                    <label class="detail-option ${this.detailLevel === 'STANDARD' ? 'selected' : ''}">
                      <input type="radio" name="detailLevel" value="STANDARD" ?checked=${this.detailLevel === 'STANDARD'} @change=${this.handleDetailLevelChange}>
                      <div class="detail-content">
                        <strong>Standard</strong>
                      </div>
                    </label>
                    
                    <label class="detail-option ${this.detailLevel === 'COMPREHENSIVE' ? 'selected' : ''}">
                      <input type="radio" name="detailLevel" value="COMPREHENSIVE" ?checked=${this.detailLevel === 'COMPREHENSIVE'} @change=${this.handleDetailLevelChange}>
                      <div class="detail-content">
                        <strong>Comprehensive</strong>
                      </div>
                    </label>
                  </div>
                </div>
                
                <label for="promptInput" class="form-label required">What kind of form do you need?</label>
                <textarea 
                  id="promptInput" 
                  name="promptInput" 
                  class="form-textarea"
                  placeholder="Example: I need a contact form with fields for name, email, phone number, and a message. Please include validation for the email field."
                  rows="4"
                  required
                ></textarea>
              </div>

              <div class="image-section" style="display: ${this.creationMethod === 'image' ? 'block' : 'none'};">
                <label for="imageInput" class="form-label required">Upload Form Image or PDF</label>
                <div class="file-upload-area">
                  <input type="file" id="imageInput" class="hidden-file-input" accept="image/*,.pdf" @change=${this.handleImageInput}>
                  <div class="file-upload-dropzone" @click=${this.handleImageUploadClick}>
                    <div class="upload-icon">📁</div>
                    <p class="upload-text">Click to select or drag and drop</p>
                    <p class="upload-subtext">Supports: JPG, PNG, GIF, PDF (max 10MB)</p>
                    <div class="upload-progress" style="display: none;">
                      <div class="upload-spinner">⏳</div>
                      <span>Uploading...</span>
                    </div>
                  </div>
                </div>
                <div class="uploaded-files" style="display: none;">
                  <div class="file-preview">
                    <span class="file-name"></span>
                    <button type="button" class="remove-file-btn" @click=${this.handleImageRemove}>×</button>
                  </div>
                </div>
                <div class="form-help-text">
                  Upload an image or PDF of an existing form that you would like to recreate
                </div>
              </div>

              <div class="url-section" style="display: ${this.creationMethod === 'url' ? 'block' : 'none'};">
                <label for="urlInput" class="form-label required">Enter the URL of the form you want to recreate</label>
                <input 
                  type="url"
                  id="urlInput" 
                  name="urlInput" 
                  class="form-input"
                  placeholder="https://example.com/contact-form"
                  required
                />
                <div class="form-help-text">
                  Provide the complete URL of an existing form that you would like to analyze and recreate
                </div>
              </div>
            </div>
          </div>
          
          <div class="dialog-footer">
            <button class="dialog-cancel-btn" @click=${this.handleDialogCancel}>Cancel</button>
            <button class="dialog-confirm-btn" @click=${this.handleDialogConfirm}>Create Form</button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('create-form', CreateForm);

// Global instance for easy access
let createFormInstance = null;

export default function createForm(formPath) {
  if (!createFormInstance) {
    createFormInstance = document.createElement('create-form');
    document.body.appendChild(createFormInstance);
  }
  createFormInstance.show(formPath);
  return createFormInstance;
}
