export const checkAMMValidity = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('http://localhost:5000/validate_amm', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) throw new Error('Network response not ok');
      
      const result = await response.json();
      return result.status === 'VALID'; // Returns true/false directly
    } catch (error) {
      console.error('Validation error:', error);
      return false; // Return false on any error
    }
  };