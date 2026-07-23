import { useState, useMemo } from 'react';
import { FiX, FiSend, FiLoader, FiUpload, FiSearch, FiFileText, FiBookOpen } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

export default function ReplyModal({ submission, type, onClose }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [brochureTab, setBrochureTab] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const recipientName = submission?.full_name || submission?.name || '';
  const recipientEmail = submission?.email || '';

  async function loadCourses() {
    if (courses.length > 0) return;
    setCoursesLoading(true);
    const { data } = await supabase
      .from('courses')
      .select('id, title, slug')
      .eq('is_published', true)
      .order('title');
    setCourses(data || []);
    setCoursesLoading(false);
  }

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(c => c.title.toLowerCase().includes(q));
  }, [courses, courseSearch]);

  async function handleUploadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const filePath = `brochure-reply/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from('pages').upload(filePath, file);
    if (upErr) {
      setError('Upload failed: ' + upErr.message);
      setUploadingFile(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('pages').getPublicUrl(filePath);
    setUploadFile(file);
    setUploadUrl(urlData.publicUrl);
    setUploadingFile(false);
  }

  function getAttachmentInfo() {
    if (type === 'brochure' && brochureTab === 'upload' && uploadUrl) {
      return { url: uploadUrl, name: uploadFile?.name || 'brochure.pdf' };
    }
    if (type === 'brochure' && brochureTab === 'select' && selectedCourse) {
      return { courseTitle: selectedCourse.title, courseId: selectedCourse.id };
    }
    return null;
  }

  async function handleSend() {
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required');
      return;
    }

    setSending(true);
    setError('');

    const payload = {
      to_email: recipientEmail,
      to_name: recipientName,
      subject: subject.trim(),
      message: message.trim(),
      type,
      attachment: getAttachmentInfo(),
    };

    try {
      const res = await fetch('/api/admin-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError('Failed to send. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Reply to {recipientName}</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{recipientEmail}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <FiSend className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Reply Sent!</h3>
            <p className="text-sm text-neutral-500 max-w-xs">
              Your reply has been sent to {recipientEmail}.
            </p>
            <button onClick={onClose} className="mt-6 px-6 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all">
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Brochure tabs */}
              {type === 'brochure' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wider">Attach Brochure</label>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => { setBrochureTab('upload'); setSelectedCourse(null); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${brochureTab === 'upload' ? 'bg-accent-600 text-white' : 'border border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}
                    >
                      <FiUpload className="w-4 h-4" /> Upload
                    </button>
                    <button
                      onClick={() => { setBrochureTab('select'); loadCourses(); setUploadUrl(''); setUploadFile(null); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${brochureTab === 'select' ? 'bg-accent-600 text-white' : 'border border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}
                    >
                      <FiBookOpen className="w-4 h-4" /> Select Course
                    </button>
                  </div>

                  {brochureTab === 'upload' && (
                    <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                      {uploadUrl ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FiFileText className="w-5 h-5 text-accent-600" />
                            <span className="text-sm text-neutral-700 truncate max-w-[250px]">{uploadFile?.name || 'brochure.pdf'}</span>
                          </div>
                          <button onClick={() => { setUploadUrl(''); setUploadFile(null); }} className="text-xs text-red-500 hover:underline">Remove</button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 py-6 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-accent-500 transition-colors">
                          {uploadingFile ? (
                            <FiLoader className="w-5 h-5 animate-spin text-neutral-400" />
                          ) : (
                            <>
                              <FiUpload className="w-5 h-5 text-neutral-400" />
                              <span className="text-sm text-neutral-500">Click to upload a brochure PDF</span>
                            </>
                          )}
                          <input type="file" accept=".pdf" onChange={handleUploadFile} className="hidden" disabled={uploadingFile} />
                        </label>
                      )}
                    </div>
                  )}

                  {brochureTab === 'select' && (
                    <div className="border border-neutral-200 rounded-lg overflow-hidden">
                      <div className="relative border-b border-neutral-200">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          value={courseSearch}
                          onChange={e => setCourseSearch(e.target.value)}
                          placeholder="Search courses..."
                          className="w-full pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-500"
                        />
                      </div>
                      <div className="max-h-36 overflow-y-auto divide-y divide-neutral-100">
                        {coursesLoading ? (
                          <div className="flex items-center justify-center py-6"><FiLoader className="w-5 h-5 animate-spin text-neutral-400" /></div>
                        ) : filteredCourses.length === 0 ? (
                          <p className="text-sm text-neutral-400 text-center py-6">No courses found</p>
                        ) : (
                          filteredCourses.map(c => (
                            <button
                              key={c.id}
                              onClick={() => setSelectedCourse(selectedCourse?.id === c.id ? null : c)}
                              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${selectedCourse?.id === c.id ? 'bg-accent-50 text-accent-700 font-medium' : 'text-neutral-700 hover:bg-neutral-50'}`}
                            >
                              <FiBookOpen className={`w-4 h-4 shrink-0 ${selectedCourse?.id === c.id ? 'text-accent-600' : 'text-neutral-400'}`} />
                              {c.title}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wider">
                  Subject {type === 'career' && <span className="text-neutral-400 normal-case">(optional — leave blank to use default)</span>}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Enter subject..."
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wider">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Write your reply message here..."
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 shrink-0">
              <span className="text-xs text-neutral-400">
                {type === 'brochure' && brochureTab === 'select' && selectedCourse
                  ? `Will send "${selectedCourse.title}" overview`
                  : type === 'brochure' && brochureTab === 'upload' && uploadUrl
                    ? 'Will attach uploaded file'
                    : 'Reply via email'}
              </span>
              <button
                onClick={handleSend}
                disabled={sending || !subject.trim() || !message.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {sending ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSend className="w-4 h-4" />}
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
