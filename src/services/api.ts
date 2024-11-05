const API_BASE_URL = 'http://localhost:3000/api';

export async function submitApplication(cv: File, knowledgeBase: string): Promise<Response> {
  const formData = new FormData();
  formData.append('cv', cv);
  formData.append('knowledgeBase', knowledgeBase);

  const response = await fetch(`${API_BASE_URL}/submit-application`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to submit application');
  }

  return response.json();
}