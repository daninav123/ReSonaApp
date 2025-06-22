import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/events.css';
import Button from '../components/common/Button';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

interface Event {
  id: string;
  title: string;
  date: string;
}

const EventsPage: React.FC = () => {
  interface ChecklistItem {
    id: string;
    text: string;
    checked: boolean;
  }

  interface FileItem {
    id: string;
    name: string;
    type?: string;
    url?: string; // Para integración futura
  }

  interface EventWithChecklist extends Event {
    checklist?: ChecklistItem[];
    files?: FileItem[];
  }

  const [events, setEvents] = useState<EventWithChecklist[]>([
    { id: '1', title: 'Boda García', date: '2025-07-15', checklist: [
      { id: 'c1', text: 'Confirmar catering', checked: false },
      { id: 'c2', text: 'Enviar invitaciones', checked: true },
    ], files: [
      { id: 'f1', name: 'contrato-boda.pdf' },
      { id: 'f2', name: 'lista-invitados.xlsx' }
    ] },
    { id: '2', title: 'Fiesta Empresa XYZ', date: '2025-08-02', checklist: [
      { id: 'c3', text: 'Reservar DJ', checked: false }
    ], files: [
      { id: 'f3', name: 'factura-empresa.pdf' }
    ] }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<string>('');
  const [fileInputValue, setFileInputValue] = useState<string>('');
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;
    setEvents([...events, { id: Date.now().toString(), title: newTitle, date: newDate }]);
    setShowModal(false);
    setNewTitle('');
    setNewDate('');
  };

  // Archivos internos (mock, preparado para backend)
  const handleAddFile = (eventId: string, file: File) => {
    setEvents(events => events.map(ev =>
      ev.id === eventId
        ? {
            ...ev,
            files: [
              ...(ev.files || []),
              { id: Date.now().toString(), name: file.name, type: file.type }
            ]
          }
        : ev
    ));
  };

  const handleEventFileDelete = (eventId: string, fileId: string) => {
    setEvents(events => events.map(ev =>
      ev.id === eventId
        ? { ...ev, files: (ev.files || []).filter(f => f.id !== fileId) }
        : ev
    ));
  };

  const handlePreviewFile = (file: FileItem) => {
    // Solo mock: muestra nombre
    setFilePreviewUrl(file.name);
  };

  const handleDownloadFile = (file: FileItem) => {
    alert('Descarga simulada: ' + file.name);
  };


  const handleDelete = (id: string) => {
    if (!window.confirm('¿Eliminar evento?')) return;
    setEvents(events.filter(ev => ev.id !== id));
  };

  // Highlight days with events
  const tileClassName = ({ date }: { date: Date }) => {
    const hasEvent = events.some(ev => ev.date === date.toISOString().slice(0, 10));
    return hasEvent ? 'event-day' : undefined;
  };

  // Events for selected day
  const eventsForSelected = selectedDate
    ? events.filter(ev => ev.date === selectedDate.toISOString().slice(0, 10))
    : [];

  const selectedEvent = eventsForSelected.find(ev => ev.id === selectedEventId) || null;

  // Checklist handlers
  const handleToggleTask = (taskId: string) => {
    if (!selectedEvent) return;
    setEvents(events => events.map(ev =>
      ev.id === selectedEvent.id
        ? { ...ev, checklist: (ev.checklist || []).map(t => t.id === taskId ? { ...t, checked: !t.checked } : t) }
        : ev
    ));
  };
  const handleAddTask = () => {
    if (!selectedEvent || !newTask.trim()) return;
    setEvents(events => events.map(ev =>
      ev.id === selectedEvent.id
        ? { ...ev, checklist: [...(ev.checklist || []), { id: Date.now().toString(), text: newTask, checked: false }] }
        : ev
    ));
    setNewTask('');
  };
  const handleDeleteTask = (taskId: string) => {
    if (!selectedEvent) return;
    setEvents(events => events.map(ev =>
      ev.id === selectedEvent.id
        ? { ...ev, checklist: (ev.checklist || []).filter(t => t.id !== taskId) }
        : ev
    ));
  };

  // Carpeta digital handlers
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedEvent || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setEvents(events => events.map(ev =>
      ev.id === selectedEvent.id
        ? { ...ev, files: [...(ev.files || []), { id: Date.now().toString(), name: file.name }] }
        : ev
    ));
    setFileInputValue('');
    // Limpiar input file
    e.target.value = '';
  };
  const handleFileInputDelete = (fileId: string) => {
    if (!selectedEvent) return;
    setEvents(events => events.map(ev =>
      ev.id === selectedEvent.id
        ? { ...ev, files: (ev.files || []).filter(f => f.id !== fileId) }
        : ev
    ));
  };

  return (
    <div className="events-page page-container">
      <h1>Eventos</h1>
      <div className="card calendar-wrapper">
        <Calendar
          onChange={date => setSelectedDate(date as Date)}
          value={selectedDate}
          tileClassName={tileClassName}
          locale="es-ES"
        />
      </div>
      {selectedDate && (
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h3>Eventos el {selectedDate.toLocaleDateString()}</h3>
          {eventsForSelected.length === 0 ? <span>No hay eventos.</span> :
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {eventsForSelected.map(ev => (
                <li key={ev.id} style={{ margin: '0.5rem 0', cursor: 'pointer', fontWeight: selectedEventId === ev.id ? 'bold' : 'normal', color: selectedEventId === ev.id ? 'var(--color-primary, #2563eb)' : undefined }} onClick={() => setSelectedEventId(ev.id)}>
                  {ev.title}
                </li>
              ))}
            </ul>
          }

          {/* Checklist del evento seleccionado */}
          {selectedEvent && (
            <div style={{ maxWidth: 400, margin: '2rem auto', background: '#f9fafb', borderRadius: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '1rem' }}>
              <h4 style={{ color: 'var(--color-primary, #2563eb)' }}>Checklist para "{selectedEvent.title}"</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0' }}>
                {(selectedEvent.checklist || []).map(task => (
                  <li key={task.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input type="checkbox" checked={task.checked} onChange={() => handleToggleTask(task.id)} />
                    <span style={{ marginLeft: 8, textDecoration: task.checked ? 'line-through' : undefined }}>{task.text}</span>
                    <Button type="button" onClick={() => handleDeleteTask(task.id)} style={{ marginLeft: 'auto', background: '#ef4444' }}>🗑️</Button>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Nueva tarea"
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
                  onKeyDown={e => { if (e.key === 'Enter') { handleAddTask(); } }}
                />
                <Button type="button" onClick={handleAddTask}>Añadir</Button>
              </div>

              {/* Carpeta digital */}
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ color: 'var(--color-primary, #2563eb)', marginBottom: 8 }}>Carpeta digital</h4>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <input
                    type="file"
                    value={fileInputValue}
                    onChange={handleFileInputChange}
                    style={{ flex: 1 }}
                  />
                </div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {(selectedEvent.files || []).map(file => (
                    <li key={file.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', background: '#fff', borderRadius: '0.375rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', padding: '0.5rem 0.75rem' }}>
                      <span style={{ flex: 1 }}>{file.name}</span>
                      <Button type="button" onClick={() => handleFileInputDelete(file.id)} style={{ background: '#ef4444' }}>🗑️</Button>
                    </li>
                  ))}
                  {(!selectedEvent.files || selectedEvent.files.length === 0) && (
                    <li style={{ color: '#888', fontStyle: 'italic', padding: '0.5rem 0' }}>No hay archivos adjuntos.</li>
                  )}
                </ul>
              </div>

              {/* Timeline visual */}
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ color: 'var(--color-primary, #2563eb)', marginBottom: 8 }}>Timeline del evento</h4>
                <ul style={{ listStyle: 'none', padding: 0, borderLeft: '2px solid #2563eb', marginLeft: 12 }}>
                  {/* Checklist items */}
                  {(selectedEvent.checklist || []).map(task => (
                    <li key={task.id} style={{ marginBottom: '1rem', position: 'relative', paddingLeft: '1.5rem' }}>
                      <span style={{ position: 'absolute', left: '-13px', top: 2, width: 12, height: 12, background: task.checked ? '#22c55e' : '#f59e42', borderRadius: '50%' }}></span>
                      <span style={{ fontWeight: 500 }}>{task.text}</span>
                      <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>({task.checked ? 'Hecho' : 'Pendiente'})</span>
                    </li>
                  ))}
                  {/* Files */}
                  {(selectedEvent.files || []).map(file => (
                    <li key={file.id} style={{ marginBottom: '1rem', position: 'relative', paddingLeft: '1.5rem' }}>
                      <span style={{ position: 'absolute', left: '-13px', top: 2, width: 12, height: 12, background: '#2563eb', borderRadius: '50%' }}></span>
                      <span style={{ fontWeight: 500 }}>{file.name}</span>
                      <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>(Archivo adjunto)</span>
                    </li>
                  ))}
                  {(!selectedEvent.checklist?.length && !selectedEvent.files?.length) && (
                    <li style={{ color: '#888', fontStyle: 'italic', padding: '0.5rem 0' }}>Sin eventos en el timeline.</li>
                  )}
                </ul>
              </div>
            </div>
           )}
          </div>
    )}
    {/* Próximamente: calendario, checklist, carpeta digital, timeline, exportar PDF */}
  </div>
);

};

export default EventsPage;
