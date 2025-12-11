import { useSpeechAssistant } from './hooks/useSpeechAssistant';
import { getReminderIcon } from './utils/reminderUtils';
import { formatDateForDisplay, calculateReminderUrgency, getUrgencyColor } from './utils/dateUtils';
import './App.css';
import { useState, useEffect } from 'react';
import { Login } from './components/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isLoggedIn', String(isLoggedIn));
  }, [isLoggedIn]);

  const {
    status,
    feedback,
    isRecording,
    toggleRecording,
    reminders,
    showRemindersList,
    showSuccessAnimation,
    isGeneratingAudio,
    loadingReminderId,
    isLoadingReminders,
    speakReminder,
    closeRemindersList,
    handleDeleteReminder,
    deleteConfirmation,
    confirmDeleteReminder,
    cancelDeleteReminder,
  } = useSpeechAssistant();

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  const getStatusIconClass = () => {
    switch (status) {
      case 'recording': return 'bi-record-circle-fill';
      case 'processing': return 'bi-hourglass-split';
      case 'ready': return 'bi-check-circle-fill';
      default: return 'bi-check-circle-fill';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'recording': return 'Gravando';
      case 'processing': return 'Processando';
      case 'ready': return 'Pronto';
      default: return 'Pronto';
    }
  };

  return (
    <div className="container">
      {deleteConfirmation && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal">
            <h3 className="delete-confirmation-title">Confirmar exclusão</h3>
            <div className="delete-confirmation-buttons">
              <button 
                className="delete-confirm-button"
                onClick={confirmDeleteReminder}
                aria-label="Confirmar exclusão"
                title="Confirmar"
              >
                <i className="bi bi-check-circle-fill"></i>
              </button>
              <button 
                className="delete-cancel-button"
                onClick={cancelDeleteReminder}
                aria-label="Cancelar exclusão"
                title="Cancelar"
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoadingReminders ? (
        <>
          <div className="loading-animation-overlay">
            <div className="loading-animation">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <p className="loading-text">Carregando lembretes...</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <header className="header-spacer">
            <button 
              onClick={() => {
                localStorage.removeItem('hasPlayedWelcome');
                setIsLoggedIn(false);
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              aria-label="Sair"
              title="Sair"
            >
              <i className="bi bi-box-arrow-right"></i>
              Sair
            </button>
          </header>

          <main className="main-content">
        <div className="status-container">
          <div 
            id="status-indicator" 
            className={`status-indicator ${status}`}
            role="status"
            aria-label={getStatusLabel()}
            title={getStatusLabel()}
          >
            <i className={`status-icon bi ${getStatusIconClass()}`} aria-hidden="true"></i>
          </div>
        </div>

        <div className="buttons-container">
          <button 
            className={`action-button main-record-button ${isRecording ? 'recording' : ''}`}
            id="recordButton" 
            aria-label="Gravar lembrete"
            onClick={toggleRecording}
          >
            <i className="button-icon bi bi-mic-fill" aria-hidden="true"></i>
          </button>
        </div>
      </main>

      {isGeneratingAudio && (
        <div className="loading-animation-overlay">
          <div className="loading-animation">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <p className="loading-text">Carregando lembretes...</p>
          </div>
        </div>
      )}

      {showRemindersList && reminders.length > 0 && (
        <div className="reminders-list-container">
          <div className="reminders-header">
            <button 
              className="close-reminders-button"
              onClick={closeRemindersList}
              aria-label="Fechar lista"
              title="Fechar"
            >
              ✕
            </button>
          </div>
          <div className="reminders-grid">
            {reminders
              .map((reminder) => ({
                ...reminder,
                urgency: calculateReminderUrgency(reminder.date, reminder.time)
              }))
              .sort((a, b) => b.urgency - a.urgency)
              .map((reminder, index) => {
              const reminderId = reminder.id || reminder.name;
              const isLoading = loadingReminderId === reminderId;
              const urgencyColor = getUrgencyColor(reminder.urgency);
              
              return (
              <div 
                key={reminder.id || index} 
                className="reminder-card"
                style={{
                  backgroundColor: reminder.urgency > 0 ? urgencyColor : '#ffffff',
                  borderColor: '#e5e7eb'
                }}
              >
                <div className="reminder-icon-large">
                  <i className={`bi ${getReminderIcon(reminder.name)}`}></i>
                </div>
                <div className="reminder-content">
                  <h3 className="reminder-name">{reminder.name}</h3>
                  <p className="reminder-datetime">
                    <i className="bi bi-calendar3"></i> {formatDateForDisplay(reminder.date)} às {reminder.time}
                  </p>
                  {isLoading && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      marginTop: '10px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #f3f4f6',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <style>{`
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                      `}</style>
                    </div>
                  )}
                </div>
                <div className="reminder-actions">
                  <button 
                    className={`reminder-listen-button ${isLoading ? 'loading' : ''}`}
                    onClick={() => speakReminder(reminder)}
                    aria-label="Ouvir lembrete"
                    title="Clique para ouvir"
                    disabled={isLoading}
                  >
                    <i className="bi bi-volume-up-fill"></i>
                  </button>
                  <button 
                    className="reminder-delete-button"
                    onClick={() => handleDeleteReminder(reminder.name)}
                    aria-label="Deletar lembrete"
                    title="Deletar lembrete"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      )}

      {showSuccessAnimation && (
        <div className="success-animation-overlay">
          <div className="success-animation">
            <div className="success-checkmark">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div className="success-rings">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
            </div>
          </div>
        </div>
      )}

      <div className="feedback-container" id="feedbackContainer">
        {feedback?.type === 'json' ? (
          <pre className="feedback-json">
            {feedback.message}
          </pre>
        ) : (
          <div className={`feedback-text ${feedback?.type || ''}`} id="feedbackText">
            {feedback?.message || ''}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}

export default App;
