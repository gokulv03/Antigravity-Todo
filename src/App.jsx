import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CalendarWidget from './components/CalendarWidget';
import CalendarPage from './components/CalendarPage';
import TaskList from './components/TaskList';
import DailyHabitsWidget from './components/DailyHabitsWidget';
import SettingsPage from './components/SettingsPage';
import NotificationsPage from './components/NotificationsPage';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LoginPage from './components/LoginPage';
import Modal from './components/Modal';
import useVoiceInput from './hooks/useVoiceInput';
import PomodoroTimer from './components/PomodoroTimer';
import { Plus, Search, Bell, X, Mic, Sun, Moon } from 'lucide-react';
import { format } from 'date-fns';
import './App.css';
import './components/ModalForm.css';

function App() {
  // User Authentication State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('tasks');
      const parsed = saved ? JSON.parse(saved) : null;
      console.log("Loaded tasks:", parsed);
      return Array.isArray(parsed) ? parsed : [
        { id: 1, title: 'Review project requirements', completed: false, priority: 'high', category: 'business', dueDate: new Date().toISOString(), subtasks: [] },
        { id: 2, title: 'Design system architecture', completed: true, priority: 'medium', category: 'business', dueDate: new Date().toISOString(), subtasks: [] },
        { id: 3, title: 'Buy groceries', completed: false, priority: 'low', category: 'personal', dueDate: null, subtasks: [] },
      ];
    } catch (e) {
      console.error("Error loading tasks:", e);
      return [
        { id: 1, title: 'Review project requirements', completed: false, priority: 'high', category: 'business', dueDate: new Date().toISOString(), subtasks: [] },
        { id: 2, title: 'Design system architecture', completed: true, priority: 'medium', category: 'business', dueDate: new Date().toISOString(), subtasks: [] },
        { id: 3, title: 'Buy groceries', completed: false, priority: 'low', category: 'personal', dueDate: null, subtasks: [] },
      ];
    }
  });

  const [currentView, setCurrentView] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState(null); // 'business', 'personal', 'habits' or null
  const [filter, setFilter] = useState('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Voice Input & Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isListening, transcript, startListening, resetTranscript, supported: voiceSupported } = useVoiceInput();

  const containerRef = React.useRef(null);

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const { left, top } = containerRef.current.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      containerRef.current.style.setProperty('--mouse-x', `${x}px`);
      containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  useEffect(() => {
    if (transcript) {
      setNewTaskTitle(prev => prev + (prev ? ' ' : '') + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const handleVoiceAdd = () => {
    startListening();
  };

  const handleAddTaskFromModal = (e) => {
    e.preventDefault();
    addTask(e);
    setIsTaskModalOpen(false);
  };

  // Settings State
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Login Handler
  const handleLogin = (userData, rememberMe) => {
    setUser(userData);
    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.removeItem('user'); // Ensure no duplicate
    } else {
      sessionStorage.setItem('user', JSON.stringify(userData));
      localStorage.removeItem('user'); // Ensure no duplicate
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setCurrentView('overview'); // Reset view
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    // Use selected category or default to 'business' if none selected (or if in habits view)
    const categoryToUse = (selectedCategory && selectedCategory !== 'habits') ? selectedCategory : 'business';

    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      completed: false,
      priority: 'medium',
      category: categoryToUse,
      dueDate: new Date().toISOString(),
      subtasks: []
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const newCompleted = !t.completed;
        const now = new Date().toISOString();
        if (newCompleted) {
          addNotification(`Completed: ${t.title}`, 'completion');
        }
        return {
          ...t,
          completed: newCompleted,
          completedAt: newCompleted ? now : null
        };
      }
      return t;
    }));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const editTask = (task) => {
    const newTitle = prompt("Edit task title:", task.title);
    if (newTitle) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, title: newTitle } : t));
    }
  };

  const updateTask = (taskId, updates) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const [businessCount, setBusinessCount] = useState(0);
  const [personalCount, setPersonalCount] = useState(0);

  // Notifications State
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (message, type) => {
    const newNotif = {
      id: Date.now(),
      message,
      type, // 'deadline', 'event', 'completion', 'milestone'
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const clearNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Check for Deadlines and Events on Mount
  useEffect(() => {
    const checkTriggers = () => {
      const now = new Date();
      const storedNotifs = JSON.parse(localStorage.getItem('notifications') || '[]');

      // 1. Check Events (Today)
      const storedEvents = localStorage.getItem('calendar_events');
      if (storedEvents) {
        const eventsMap = JSON.parse(storedEvents);
        const todayKey = format(now, 'yyyy-MM-dd');
        const todaysEvents = eventsMap[todayKey] || [];

        todaysEvents.forEach(ev => {
          // Avoid duplicates: check if we already notified for this event title today
          // Simple check: see if a notification with same message exists (created recently? or just exists)
          // For simplicity, we'll just check if it exists in current state to avoid spam on refresh
          const msg = `Event Today: ${ev.title}`;
          const alreadyNotified = storedNotifs.some(n => n.message === msg);
          if (!alreadyNotified) {
            addNotification(msg, 'event');
          }
        });
      }

      // 2. Check Task Deadlines (Next 24h)
      tasks.forEach(task => {
        if (!task.completed && task.dueDate) {
          const due = new Date(task.dueDate);
          const diffHours = (due - now) / (1000 * 60 * 60);
          if (diffHours > 0 && diffHours <= 24) {
            const msg = `Deadline soon: "${task.title}" is due in ${Math.round(diffHours)} hours.`;
            // Simple duplicate check
            const alreadyNotified = storedNotifs.some(n => n.message === msg);
            if (!alreadyNotified) {
              // We can't call addNotification directly here safely if we rely on storedNotifs from closure, 
              // but we are inside useEffect. 
              // We'll dispatch it.
              // Actually, we should be careful about the dependency array. 
              // Check triggers usually runs once on session start or periodically.
              // For now, let's just allow it to run once on mount.
              // To update state we need to use the functional update or dependency.
              // But since we are inside useEffect with [] dependency (conceptually, or `tasks` dependency), 
              // let's just trigger it. 
              // NOTE: triggers will fire every time tasks change if we add tasks to dep array. 
              // Better to checking "alreadyNotified" against the live state? 
              // Let's rely on simple message existence.

              // Re-reading 'notifications' state inside the effect or passing it?
              // Better: functional update in addNotification is already there.
              // But we need to check existence to prevent infinite loops if we depend on notifications.
              // SOLUTION: Check existence in the setter or use a ref for "triggersChecked".
              // For this iteration: Strict duplicate check in addNotification?
            }
          }
        }
      });
    };

    // Simplification: We blindly run checkTriggers. 
    // Any logic to prevent duplicates needs access to current notifications.
    // We will rely on a "triggered" flag in sessionStorage for this session?
    // Or just simple check:

    // Let's implement duplicate check inside addNotification? 
    // No, addNotification doesn't know context.

    // Let's just run this once on mount.
    checkTriggers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on app load to check

  // Enhanced Add Task to check duplicates not needed here, but for completion triggers.

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ tasks: [], events: [] });



  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Update category counts
    setBusinessCount(tasks.filter(t => t.category === 'business' && !t.completed).length);
    setPersonalCount(tasks.filter(t => t.category === 'personal' && !t.completed).length);

    // Live Search Update
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [tasks, searchQuery]); // Re-run search if tasks change

  const performSearch = (query) => {
    const lowerQuery = query.toLowerCase();

    // 1. Search Tasks
    const foundTasks = tasks.filter(t => t.title.toLowerCase().includes(lowerQuery));

    // 2. Search Events (from LocalStorage)
    const storedEvents = localStorage.getItem('calendar_events');
    let foundEvents = [];
    if (storedEvents) {
      const eventsMap = JSON.parse(storedEvents);
      // eventsMap is { 'yyyy-mm-dd': [{id, title}, ...] }
      Object.entries(eventsMap).forEach(([date, dayEvents]) => {
        dayEvents.forEach(ev => {
          if (ev.title.toLowerCase().includes(lowerQuery)) {
            foundEvents.push({ ...ev, date });
          }
        });
      });
    }

    setSearchResults({ tasks: foundTasks, events: foundEvents });
  };
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // Calculate category progress
  const getCategoryProgress = (cat) => {
    const catTasks = tasks.filter(t => t.category === cat);
    if (catTasks.length === 0) return 0;
    return (catTasks.filter(t => t.completed).length / catTasks.length) * 100;
  };

  // Smart Categorization Logic
  const determineCategory = (title) => {
    const lowerTitle = title.toLowerCase();
    const businessKeywords = ['meeting', 'email', 'report', 'project', 'code', 'design', 'client', 'review', 'sync', 'standup', 'bug', 'fix', 'deploy', 'presentation', 'call', 'work', 'teams', 'slack', 'jira'];
    const personalKeywords = ['groceries', 'buy', 'gym', 'workout', 'dinner', 'lunch', 'mom', 'dad', 'doctor', 'movie', 'sleep', 'clean', 'wash', 'laundry', 'bills', 'pay', 'party', 'date', 'home', 'kids', 'vet'];

    if (businessKeywords.some(k => lowerTitle.includes(k))) return 'business';
    if (personalKeywords.some(k => lowerTitle.includes(k))) return 'personal';

    return 'personal'; // Default
  };

  const renderContent = () => {
    console.log("Rendering content. Current View:", currentView);
    if (currentView === 'calendar') {
      return <CalendarPage />;
    }

    if (currentView === 'settings') {
      return (
        <SettingsPage
          user={user}
          currentTheme={theme}
          onThemeChange={setTheme}
        />
      );
    }

    if (currentView === 'notifications') {
      return <NotificationsPage notifications={notifications} onClear={clearNotification} />;
    }

    if (currentView === 'analytics') {
      return <AnalyticsDashboard tasks={tasks} />;
    }

    if (currentView === 'analytics') {
      return <AnalyticsDashboard tasks={tasks} />;
    }

    if (currentView === 'pomodoro') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div style={{ width: '400px', transform: 'scale(1.2)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Focus Timer</h2>
            <PomodoroTimer />
          </div>
        </div>
      );
    }

    const filteredTasks = tasks.filter(task => {
      if (selectedCategory && selectedCategory !== 'habits' && task.category !== selectedCategory) return false;
      return true;
    });

    const isHabitsView = selectedCategory === 'habits';

    return (
      <div className="content-grid new-dashboard-layout">
        <div className="tasks-section">
          {/* Header with Search Toggle */}
          <div className="section-header">
            {isSearchOpen ? (
              <div className="search-bar-container">
                <Search size={20} className="search-icon" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search tasks & events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}>
                  <X size={20} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            ) : (
              <div className="header-content">
                <h1>What's up, {user ? user.name.split(' ')[0] : 'Guest'}!</h1>
                <p className="subtitle">CATEGORIES</p>
              </div>
            )}

            {!isSearchOpen && (
              <div className="header-actions">
                <div className="user-actions">
                  <button className="icon-btn" onClick={() => setIsSearchOpen(true)}>
                    <Search size={20} />
                  </button>
                  <button className="icon-btn" onClick={() => {
                    const newTheme = theme === 'light' ? 'dark' : 'light';
                    setTheme(newTheme);

                  }} title="Toggle Theme">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                  </button>
                  <button className="icon-btn" onClick={() => setCurrentView('notifications')} style={{ position: 'relative' }}>
                    <Bell size={20} />
                    {notifications.length > 0 && <span style={{
                      position: 'absolute', top: '-2px', right: '-2px',
                      width: '8px', height: '8px', background: 'var(--danger)',
                      borderRadius: '50%', border: '1px solid var(--bg-primary)'
                    }}></span>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search Results OR Standard View */}
          {isSearchOpen && searchQuery ? (
            <div className="search-results-section">
              <p className="search-section-title">FOUND TASKS ({searchResults.tasks.length})</p>
              {searchResults.tasks.length > 0 ? (
                <TaskList
                  tasks={searchResults.tasks}
                  filter="all"
                  onComplete={toggleTask}
                  onDelete={deleteTask}
                  onEdit={editTask}
                />
              ) : (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '2rem' }}>No tasks found.</p>
              )}

              <p className="search-section-title">FOUND EVENTS ({searchResults.events.length})</p>
              {searchResults.events.length > 0 ? (
                searchResults.events.map(ev => (
                  <div key={ev.id} className="event-result-card">
                    <span className="event-title">{ev.title}</span>
                    <span className="event-date">{new Date(ev.date).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No events found.</p>
              )}
            </div>
          ) : (
            <>
              {/* Categories Scroll */}
              <div className="categories-scroll">
                <div
                  className={`category-card business ${selectedCategory === 'business' ? 'active-card' : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === 'business' ? null : 'business')}
                >
                  <span className="task-count">{businessCount} tasks</span>
                  <h3>Business</h3>
                  <div className="progress-line">
                    <div className="progress-fill" style={{ width: `${getCategoryProgress('business')}%` }}></div>
                  </div>
                </div>

                <div
                  className={`category-card personal ${selectedCategory === 'personal' ? 'active-card' : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === 'personal' ? null : 'personal')}
                >
                  <span className="task-count">{personalCount} tasks</span>
                  <h3>Personal</h3>
                  <div className="progress-line">
                    <div className="progress-fill" style={{ width: `${getCategoryProgress('personal')}%` }}></div>
                  </div>
                </div>

                <div
                  className={`category-card habits ${selectedCategory === 'habits' ? 'active-card' : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === 'habits' ? null : 'habits')}
                >
                  <span className="task-count">Daily</span>
                  <h3>Habits</h3>
                  <div className="progress-line">
                    <div className="progress-fill" style={{ width: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}></div>
                  </div>
                </div>
              </div>

              {isHabitsView ? (
                <div className="animate-fade-in">
                  <p className="section-label">DAILY TRACKER</p>
                  <DailyHabitsWidget addNotification={addNotification} />
                </div>
              ) : (
                <>
                  <p className="section-label">
                    {selectedCategory ? `${selectedCategory.toUpperCase()} TASKS` : "TODAY'S TASKS"}
                  </p>

                  <div className="filter-tabs" style={{ marginBottom: '1rem', border: 'none' }}>
                    <button
                      className={`tab ${filter === 'all' ? 'active' : ''}`}
                      onClick={() => setFilter('all')}
                    >All</button>
                    <button
                      className={`tab ${filter === 'active' ? 'active' : ''}`}
                      onClick={() => setFilter('active')}
                    >Active</button>
                    <button
                      className={`tab ${filter === 'completed' ? 'active' : ''}`}
                      onClick={() => setFilter('completed')}
                    >Completed</button>
                  </div>

                  <TaskList
                    tasks={filteredTasks}
                    filter={filter}
                    onComplete={toggleTask}
                    onDelete={deleteTask}
                    onEdit={editTask}
                    onUpdate={updateTask}
                  />
                </>
              )}
            </>
          )}
        </div>

        {/* FAB */}
        {!isHabitsView && !isSearchOpen && (
          <button className="fab-btn" onClick={() => {
            setNewTaskTitle('');
            setIsTaskModalOpen(true);
          }}>
            <Plus size={24} />
          </button>
        )}
      </div>
    );
  };



  // Conditional Rendering for Login
  if (!user) {
    return (
      <div className={`app-container theme-${theme}`}>
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }







  return (
    <div
      className={`app-container theme-${theme}`}
      ref={containerRef}
      onMouseMove={handleMouseMove}
    >
      {/* Ambient Orbs */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>

      {/* Global Spotlight */}
      <div className="spotlight-overlay"></div>

      <div className="app-overlay" style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}></div>

      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
        <span style={{ fontSize: '1.5rem' }}>☰</span>
      </button>

      {/* Mobile Overlay to close sidebar */}
      {
        isSidebarOpen && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              zIndex: 40, backdropFilter: 'blur(4px)'
            }}
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )
      }

      <Sidebar
        activeView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false); // Close on selection
        }}
        user={user}
        onLogout={handleLogout}
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="main-content">
        {renderContent()}
      </main>

      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add New Task"
      >
        <form onSubmit={handleAddTaskFromModal} className="modal-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
              className="modal-input"
            />
            {voiceSupported && (
              <button
                type="button"
                className={`mic-btn ${isListening ? 'listening' : ''}`}
                onClick={handleVoiceAdd}
                title="Speak to add"
              >
                <Mic size={20} />
              </button>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={() => setIsTaskModalOpen(false)}>Cancel</button>
            <button type="submit" className="confirm-btn">Add Task</button>
          </div>
        </form>
      </Modal>
    </div >
  );
}

export default App;
