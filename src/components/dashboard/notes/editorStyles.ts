
export const injectEditorStyles = () => {
  // Create style element
  const style = document.createElement('style');
  
  // Add CSS styles for the editor
  style.innerHTML = `
    .editor-content {
      color: var(--foreground);
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.2;
    }
    
    .editor-content h1 {
      font-family: 'Inter', sans-serif;
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
      margin-top: 24px;
      margin-bottom: 10px;
      color: var(--foreground);
    }
    
    .editor-content h2 {
      font-family: 'Inter', sans-serif;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.2;
      margin-top: 20px;
      margin-bottom: 10px;
      color: var(--foreground);
    }
    
    .editor-content h3 {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.2;
      margin-top: 14px;
      margin-bottom: 10px;
      color: var(--foreground);
    }
    
    .editor-content p {
      margin-top: 0;
      margin-bottom: 10px;
      line-height: 1.2;
    }
    
    .editor-content ul {
      list-style-type: disc;
      padding-left: 1.5rem;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .editor-content ol {
      list-style-type: decimal;
      padding-left: 1.5rem;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .editor-content li {
      margin-top: 0.25rem;
      margin-bottom: 0.25rem;
    }
    
    /* Make text and bullet points the same color */
    .dark .editor-content * {
      color: #FFFFFF !important;
    }
    
    .dark .editor-content ul > li::marker,
    .dark .editor-content ol > li::marker {
      color: #FFFFFF !important;
    }
    
    .editor-content * {
      color: #0A1915 !important;
    }
    
    .editor-content ul > li::marker,
    .editor-content ol > li::marker {
      color: #0A1915 !important;
    }
    
    .editor-content a {
      color: #14A090 !important;
    }
  `;
  
  // Append to document head
  document.head.appendChild(style);
  
  // Return a function to clean up the style when no longer needed
  return () => {
    document.head.removeChild(style);
  };
};
