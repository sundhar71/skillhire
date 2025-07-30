import React from 'react';

const TestApp = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>
          🚀 SkillHire Test Page
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          If you can see this page, the React app is working!
        </p>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: '#059669', margin: '0.5rem 0' }}>✅ React 18 + Vite</p>
          <p style={{ color: '#059669', margin: '0.5rem 0' }}>✅ Frontend Server Running</p>
          <p style={{ color: '#059669', margin: '0.5rem 0' }}>✅ Basic Routing Working</p>
        </div>
        <button 
          onClick={() => {
            alert('Button clicked! React is working properly.');
            console.log('Test button clicked - React is functional');
          }}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Test Button
        </button>
        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          <p>Next steps:</p>
          <p>• Visit <strong>/login</strong> to test authentication</p>
          <p>• Visit <strong>/dashboard</strong> to test full app</p>
        </div>
      </div>
    </div>
  );
};

export default TestApp;