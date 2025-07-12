export const getCsrfToken = async (): Promise<string> => {
    const res = await fetch('http://localhost:5001/api/auth/csrf-token', {
      credentials: 'include', // ensures cookies are sent
    });
    const data = await res.json();
    return data.csrfToken;
  };