'use client';

import { useState, useEffect, useMemo } from 'react';

interface Client {
  id: string;
  company_name: string;
  country: string;
  entity_type: string;
}

interface Task {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  due_date: string;
  status: 'Pending' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
}

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '', description: '', category: 'Tax', due_date: '', priority: 'Medium'
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchTasks(selectedClient.id);
    } else {
      setTasks([]);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(data);
      if (data.length > 0) {
        setSelectedClient(data[0]);
      }
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const fetchTasks = async (clientId: string) => {
    try {
      const res = await fetch(`/api/tasks?clientId=${clientId}`);
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      // Optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, client_id: selectedClient.id }),
      });
      const createdTask = await res.json();
      setTasks([...tasks, createdTask]);
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', category: 'Tax', due_date: '', priority: 'Medium' });
    } catch (e) {
      console.error(e);
    }
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date() && new Date().toDateString() !== new Date(dateString).toDateString();
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (statusFilter !== 'All' && task.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && task.category !== categoryFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const overdue = tasks.filter(t => t.status === 'Pending' && isOverdue(t.due_date)).length;
    return { total, pending, overdue };
  }, [tasks]);

  const categories = useMemo(() => {
    const cats = new Set(tasks.map(t => t.category));
    return ['All', ...Array.from(cats)];
  }, [tasks]);

  if (isLoading) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>Loading workspace...</div>;

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">LedgersCFO Compliance</h1>
        {selectedClient && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + Add Task
          </button>
        )}
      </header>

      <div className="layout">
        {/* Sidebar: Clients */}
        <aside className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Clients</h2>
          <div className="client-list">
            {clients.map(client => (
              <button
                key={client.id}
                className={`client-item ${selectedClient?.id === client.id ? 'active' : ''}`}
                onClick={() => setSelectedClient(client)}
              >
                <strong>{client.company_name}</strong>
                <small>{client.entity_type} • {client.country}</small>
              </button>
            ))}
          </div>
        </aside>

        {/* Main: Tasks */}
        <main>
          {selectedClient ? (
            <>
              {/* Stats overview */}
              <div className="summary-stats">
                <div className="stat-box">
                  <small>Total Tasks</small>
                  <span>{stats.total}</span>
                </div>
                <div className="stat-box">
                  <small>Pending Tasks</small>
                  <span>{stats.pending}</span>
                </div>
                <div className={`stat-box ${stats.overdue > 0 ? 'danger' : ''}`}>
                  <small>Overdue</small>
                  <span>{stats.overdue}</span>
                </div>
              </div>

              {/* Filters */}
              <div className="filters card">
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Status Filter</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Category Filter</label>
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              {/* Task List */}
              <div className="task-list">
                {filteredTasks.length === 0 ? (
                  <div className="empty-state card">
                    <h3>No tasks found</h3>
                    <p>Change your filters or add a new task for this client.</p>
                  </div>
                ) : (
                  filteredTasks.map(task => {
                    const overdue = task.status === 'Pending' && isOverdue(task.due_date);
                    return (
                      <div key={task.id} className={`task-card ${overdue ? 'overdue' : ''}`}>
                        <div className="task-info">
                          <h3>{task.title}</h3>
                          <p>{task.description}</p>
                          <div className="task-meta">
                            <span className="badge badge-category">{task.category}</span>
                            <span className={`badge ${task.status === 'Pending' ? (overdue ? 'badge-danger' : 'badge-pending') : 'badge-completed'}`}>
                              {overdue ? 'OVERDUE' : task.status}
                            </span>
                            <small>Due: {new Date(task.due_date).toLocaleDateString()}</small>
                            {task.priority === 'High' && <span className="badge" style={{ background: '#ef4444', color: '#fff' }}>High Priority</span>}
                          </div>
                        </div>
                        <div className="task-actions">
                          <button 
                            className="btn btn-outline" 
                            style={{ minWidth: '130px' }}
                            onClick={() => handleStatusToggle(task.id, task.status)}
                          >
                            Mark {task.status === 'Pending' ? 'Completed' : 'Pending'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="empty-state card">
              <h2>Select a client to view tasks</h2>
            </div>
          )}
        </main>
      </div>

      {/* Add Task Modal */}
      <div className={`modal-backdrop ${isModalOpen ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-header">
            <h2>Add New Task</h2>
            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setIsModalOpen(false)}>✕</button>
          </div>
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label>Title *</label>
              <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="E.g., File Q2 Returns"/>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} placeholder="Optional description..." />
            </div>
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Category *</label>
                <input required type="text" value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} placeholder="Tax, Audit, Filing..." />
              </div>
              <div>
                <label>Due Date *</label>
                <input required type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Task</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
