import React from "react";

const NamePromptModal = ({ isOpen, onClose, onSubmit }) => {
  const [chatName, setChatName] = React.useState("");

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ background: '#23243a', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(25,195,125,0.18)', minWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ color: '#fff', marginBottom: '18px' }}>Name your new chat</h2>
        <input
          type="text"
          value={chatName}
          onChange={e => setChatName(e.target.value)}
          placeholder="Enter chat name"
          style={{ padding: '12px', borderRadius: '8px', border: 'none', fontSize: '1.1rem', width: '100%', marginBottom: '18px' }}
        />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => onSubmit(chatName)} style={{ padding: '10px 24px', borderRadius: '8px', background: '#19c37d', color: '#fff', border: 'none', fontWeight: '600', fontSize: '1rem' }}>Create</button>
          <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: '8px', background: '#ff4b4b', color: '#fff', border: 'none', fontWeight: '600', fontSize: '1rem' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default NamePromptModal;
