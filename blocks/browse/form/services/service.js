class FormsService {
  constructor() {
    this.baseUrl = 'http://localhost:8000/api/v1';
    this.tenant = '';
    this.daLiveBaseUrl = 'https://admin.da.live/source/jalagari/forms-live';
  }

  async uploadFile(file) {
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_${timestamp}.${fileExtension}`;
    const uploadUrl = `${this.daLiveBaseUrl}/tmp/${filename}`;

    const formData = new FormData();
    formData.append('data', file);

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    return uploadUrl;
  }

  async createForm(formData) {
    const {
      formName, prompt, fileUrl, url, detailLevel, formPath,
    } = formData;

    const payload = {
      detail_level: detailLevel || 'STANDARD',
      generate_json: 'true',
      form_path: `${formPath}`,
      name: formName,
      text: prompt,
      path: fileUrl,
      form_url: url,
    };

    console.log('Calling form creation API with payload:', payload);

    const response = await fetch(`${this.baseUrl}/flow/kickoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Form creation API response:', result);

    return result;
  }
}

const formsService = new FormsService();
export default formsService;
