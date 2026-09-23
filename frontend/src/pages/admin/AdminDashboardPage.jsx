import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

const COLORS = ['#2563EB', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#7C3AED'];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('');
  const [form, setForm] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const res = await API.get('/admin/dashboard');
      setDashboard(res.data.data);
      const catRes = await API.get('/categories');
      setCategories(catRes.data.data || []);
      const topicRes = await API.get('/topics');
      setTopics(topicRes.data.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadStudents = async () => {
    const res = await API.get(`/admin/students?search=${searchTerm}`);
    setStudents(res.data.data || []);
  };

  const loadQuestions = async () => {
    const res = await API.get('/questions?limit=100');
    setQuestions(res.data.data || []);
  };

  const loadTests = async () => {
    const res = await API.get('/tests/admin/all');
    setTests(res.data.data || []);
  };

  const loadAnalytics = async () => {
    const res = await API.get('/admin/analytics');
    setAnalytics(res.data.data);
  };

  useEffect(() => {
    if (tab === 'students') loadStudents();
    if (tab === 'questions') loadQuestions();
    if (tab === 'tests') loadTests();
    if (tab === 'analytics') loadAnalytics();
  }, [tab]);

  const toggleBlock = async (id) => {
    await API.put(`/admin/students/${id}/block`);
    loadStudents();
    toast.success('Updated');
  };

  const deleteStudent = async (id) => {
    if (!confirm('Delete this student?')) return;
    await API.delete(`/admin/students/${id}`);
    loadStudents();
    toast.success('Deleted');
  };

  const saveQuestion = async () => {
    try {
      const payload = {
        ...form,
        options: [
          { label: 'A', text: form.optionA || '' },
          { label: 'B', text: form.optionB || '' },
          { label: 'C', text: form.optionC || '' },
          { label: 'D', text: form.optionD || '' }
        ]
      };
      if (form._id) {
        await API.put(`/questions/${form._id}`, payload);
      } else {
        await API.post('/questions', payload);
      }
      toast.success('Question saved!');
      setShowForm(false);
      setForm({});
      loadQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const deleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return;
    await API.delete(`/questions/${id}`);
    loadQuestions();
    toast.success('Deleted');
  };

  const saveTest = async () => {
    try {
      const payload = {
        ...form,
        totalMarks: (form.numberOfQuestions || 0) * (form.marksPerQuestion || 1)
      };
      if (form._id) {
        await API.put(`/tests/${form._id}`, payload);
      } else {
        await API.post('/tests', payload);
      }
      toast.success('Test saved!');
      setShowForm(false);
      setForm({});
      loadTests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const deleteTest = async (id) => {
    if (!confirm('Delete this test?')) return;
    await API.delete(`/tests/${id}`);
    loadTests();
    toast.success('Deleted');
  };

  const exportCSV = () => { window.open('/api/admin/export', '_blank'); };

  const navItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'questions', icon: '❓', label: 'Questions' },
    { key: 'tests', icon: '📝', label: 'Tests' },
    { key: 'students', icon: '👥', label: 'Students' },
    { key: 'analytics', icon: '📈', label: 'Analytics' }
  ];

  if (loading) return <div className="loader-container" style={{ paddingTop: '120px' }}><div className="spinner" /></div>;

  const u = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-title">Admin Panel</div>
        {navItems.map(n => (
          <button key={n.key} className={`admin-nav-item ${tab === n.key ? 'active' : ''}`} onClick={() => { setTab(n.key); setShowForm(false); }}>
            <span>{n.icon}</span> {n.label}
          </button>
        ))}
        <div style={{ marginTop: '24px' }}>
          <button className="admin-nav-item" onClick={exportCSV}>📥 Export Results</button>
        </div>
      </div>

      {/* Content */}
      <div className="admin-content">
        {/* DASHBOARD TAB */}
        {tab === 'dashboard' && dashboard && (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Admin Dashboard</h2>
            <div className="dashboard-stats">
              {[
                { label: 'Total Students', value: dashboard.totalStudents, icon: '👥', bg: 'rgba(37,99,235,0.15)', color: '#3B82F6' },
                { label: 'Total Questions', value: dashboard.totalQuestions, icon: '❓', bg: 'rgba(6,182,212,0.15)', color: '#06B6D4' },
                { label: 'Total Tests', value: dashboard.totalTests, icon: '📝', bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
                { label: 'Total Attempts', value: dashboard.totalAttempts, icon: '📊', bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
                { label: 'Avg Score', value: `${dashboard.avgScore}%`, icon: '🎯', bg: 'rgba(124,58,237,0.15)', color: '#7C3AED' }
              ].map((s, i) => (
                <div className="dash-stat-card" key={i}>
                  <div className="dash-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                  <div><div className="dash-stat-value">{s.value}</div><div className="dash-stat-label">{s.label}</div></div>
                </div>
              ))}
            </div>
            {dashboard.recentAttempts?.length > 0 && (
              <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Recent Attempts</h3>
                <table className="data-table">
                  <thead><tr><th>Student</th><th>Test</th><th>Score</th><th>Date</th></tr></thead>
                  <tbody>
                    {dashboard.recentAttempts.map((a, i) => (
                      <tr key={i}><td>{a.user?.name}</td><td>{a.test?.name}</td><td><span className={`badge ${a.percentage >= 60 ? 'badge-easy' : 'badge-hard'}`}>{a.percentage}%</span></td><td>{new Date(a.submittedAt).toLocaleDateString()}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* QUESTIONS TAB */}
        {tab === 'questions' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Questions ({questions.length})</h2>
              <button className="btn btn-primary" onClick={() => { setShowForm(true); setForm({}); }}>+ Add Question</button>
            </div>
            {showForm && (
              <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>{form._id ? 'Edit' : 'Add'} Question</h3>
                <div className="form-group"><label className="form-label">Question *</label><textarea className="form-input" rows="3" value={form.question || ''} onChange={e => u('question', e.target.value)} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Category *</label><select className="form-select" value={form.category || ''} onChange={e => u('category', e.target.value)}><option value="">Select</option>{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Topic *</label><select className="form-select" value={form.topic || ''} onChange={e => u('topic', e.target.value)}><option value="">Select</option>{topics.filter(t => !form.category || t.category?._id === form.category || t.category === form.category).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Difficulty *</label><select className="form-select" value={form.difficulty || ''} onChange={e => u('difficulty', e.target.value)}><option value="">Select</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Option A *</label><input className="form-input" value={form.optionA || ''} onChange={e => u('optionA', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Option B *</label><input className="form-input" value={form.optionB || ''} onChange={e => u('optionB', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Option C *</label><input className="form-input" value={form.optionC || ''} onChange={e => u('optionC', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Option D *</label><input className="form-input" value={form.optionD || ''} onChange={e => u('optionD', e.target.value)} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Correct Answer *</label><select className="form-select" value={form.correctAnswer || ''} onChange={e => u('correctAnswer', e.target.value)}><option value="">Select</option><option>A</option><option>B</option><option>C</option><option>D</option></select></div>
                  <div className="form-group"><label className="form-label">Marks</label><input type="number" className="form-input" value={form.marks || 1} onChange={e => u('marks', Number(e.target.value))} /></div>
                  <div className="form-group"><label className="form-label">Negative Marks</label><input type="number" className="form-input" step="0.25" value={form.negativeMark || 0} onChange={e => u('negativeMark', Number(e.target.value))} /></div>
                </div>
                <div className="form-group"><label className="form-label">Explanation</label><textarea className="form-input" rows="2" value={form.explanation || ''} onChange={e => u('explanation', e.target.value)} /></div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary" onClick={saveQuestion}>Save Question</button>
                  <button className="btn btn-ghost" onClick={() => { setShowForm(false); setForm({}); }}>Cancel</button>
                </div>
              </div>
            )}
            <div className="card" style={{ padding: '0', overflow: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Question</th><th>Category</th><th>Topic</th><th>Difficulty</th><th>Actions</th></tr></thead>
                <tbody>
                  {questions.map((q, i) => (
                    <tr key={i}>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</td>
                      <td>{q.category?.name || '-'}</td>
                      <td>{q.topic?.name || '-'}</td>
                      <td><span className={`badge ${q.difficulty === 'easy' ? 'badge-easy' : q.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'}`}>{q.difficulty}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ ...q, optionA: q.options?.[0]?.text, optionB: q.options?.[1]?.text, optionC: q.options?.[2]?.text, optionD: q.options?.[3]?.text, category: q.category?._id || q.category, topic: q.topic?._id || q.topic }); setShowForm(true); }}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteQuestion(q._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TESTS TAB */}
        {tab === 'tests' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Tests ({tests.length})</h2>
              <button className="btn btn-primary" onClick={() => { setShowForm(true); setFormType('test'); setForm({}); }}>+ Create Test</button>
            </div>
            {showForm && (
              <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>{form._id ? 'Edit' : 'Create'} Test</h3>
                <div className="form-group"><label className="form-label">Test Name *</label><input className="form-input" value={form.name || ''} onChange={e => u('name', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows="2" value={form.description || ''} onChange={e => u('description', e.target.value)} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={form.category || ''} onChange={e => u('category', e.target.value)}><option value="">Mixed</option>{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Difficulty</label><select className="form-select" value={form.difficulty || 'mixed'} onChange={e => u('difficulty', e.target.value)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="mixed">Mixed</option></select></div>
                  <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={form.type || 'mock'} onChange={e => u('type', e.target.value)}><option value="mock">Mock</option><option value="practice">Practice</option><option value="placement">Placement</option></select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label"># Questions *</label><input type="number" className="form-input" value={form.numberOfQuestions || ''} onChange={e => u('numberOfQuestions', Number(e.target.value))} /></div>
                  <div className="form-group"><label className="form-label">Duration (min) *</label><input type="number" className="form-input" value={form.duration || ''} onChange={e => u('duration', Number(e.target.value))} /></div>
                  <div className="form-group"><label className="form-label">Marks/Q</label><input type="number" className="form-input" value={form.marksPerQuestion || 1} onChange={e => u('marksPerQuestion', Number(e.target.value))} /></div>
                  <div className="form-group"><label className="form-label">Neg. Marks</label><input type="number" step="0.25" className="form-input" value={form.negativeMarking || 0} onChange={e => u('negativeMarking', Number(e.target.value))} /></div>
                </div>
                <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={form.isPublished || false} onChange={e => u('isPublished', e.target.checked)} /> Published</label></div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary" onClick={saveTest}>Save Test</button>
                  <button className="btn btn-ghost" onClick={() => { setShowForm(false); setForm({}); }}>Cancel</button>
                </div>
              </div>
            )}
            <div className="grid-3">
              {tests.map((t, i) => (
                <div className="card" key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ fontWeight: 700 }}>{t.name}</h3>
                    <span className={`badge ${t.isPublished ? 'badge-easy' : 'badge-hard'}`}>{t.isPublished ? 'Published' : 'Draft'}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>{t.numberOfQuestions} questions • {t.duration} min • {t.difficulty}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ ...t, category: t.category?._id || t.category }); setShowForm(true); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteTest(t._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* STUDENTS TAB */}
        {tab === 'students' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Students</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input className="form-input" placeholder="Search students..." style={{ width: '250px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadStudents()} />
                <button className="btn btn-ghost btn-sm" onClick={loadStudents}>Search</button>
              </div>
            </div>
            <div className="card" style={{ padding: '0', overflow: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Name</th><th>Email</th><th>College</th><th>XP</th><th>Tests</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.college || '-'}</td>
                      <td>{s.xp}</td>
                      <td>{s.totalTestsAttempted}</td>
                      <td><span className={`badge ${s.isBlocked ? 'badge-hard' : 'badge-easy'}`}>{s.isBlocked ? 'Blocked' : 'Active'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => toggleBlock(s._id)}>{s.isBlocked ? 'Unblock' : 'Block'}</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteStudent(s._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ANALYTICS TAB */}
        {tab === 'analytics' && analytics && (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Platform Analytics</h2>
            <div className="dashboard-stats" style={{ marginBottom: '24px' }}>
              <div className="dash-stat-card"><div className="dash-stat-icon" style={{ background: 'rgba(37,99,235,0.15)', color: '#3B82F6' }}>📊</div><div><div className="dash-stat-value">{analytics.totalAttempts}</div><div className="dash-stat-label">Total Attempts</div></div></div>
              <div className="dash-stat-card"><div className="dash-stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>🎯</div><div><div className="dash-stat-value">{Math.round(analytics.scoreStats?.avgScore || 0)}%</div><div className="dash-stat-label">Avg Score</div></div></div>
              <div className="dash-stat-card"><div className="dash-stat-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4' }}>🏆</div><div><div className="dash-stat-value">{Math.round(analytics.scoreStats?.highestScore || 0)}%</div><div className="dash-stat-label">Highest Score</div></div></div>
              <div className="dash-stat-card"><div className="dash-stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>📈</div><div><div className="dash-stat-value">{Math.round(analytics.scoreStats?.avgAccuracy || 0)}%</div><div className="dash-stat-label">Avg Accuracy</div></div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="chart-card">
                <div className="chart-title">Most Attempted Topics</div>
                {analytics.topicStats?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={analytics.topicStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="_id" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '8px', color: '#F1F5F9' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>{analytics.topicStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="empty-state"><p>No data</p></div>}
              </div>
              <div className="chart-card">
                <div className="chart-title">Registration Trend</div>
                {analytics.registrationTrend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={analytics.registrationTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="_id" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '8px', color: '#F1F5F9' }} />
                      <Line type="monotone" dataKey="count" stroke="#06B6D4" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <div className="empty-state"><p>No data</p></div>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
