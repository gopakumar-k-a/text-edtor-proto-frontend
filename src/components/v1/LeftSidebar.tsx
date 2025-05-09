import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Template {
  _id: string;
  name: string;
  content: any;
}

interface LeftSidebarProps {
  onSelect: (template: Template) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onSelect }) => {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/templates')
      .then(response => setTemplates(response.data))
      .catch(error => console.error('Error fetching templates:', error));
  }, []);

  return (
    <div style={{
      width: '20%',
      backgroundColor: '#f4f4f9',
      borderRight: '1px solid #ddd',
      padding: '10px',
      height: '100vh',
      overflowY: 'auto',
    }}>
      <h3 style={{ color: '#333', marginBottom: '10px' }}>Saved Templates</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {templates.map(template => (
          <li
            key={template._id}
            onClick={() => onSelect(template)}
            style={{
              padding: '8px',
              cursor: 'pointer',
              borderRadius: '4px',
              marginBottom: '5px',
              backgroundColor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0ff'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            {template.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeftSidebar;