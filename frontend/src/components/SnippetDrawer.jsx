import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Search,
  Copy,
  Check,
  ArrowDownToLine,
  BookOpen,
  Code2,
  FileCode2,
  Key,
  ShieldCheck,
  CreditCard,
  Layers,
  Sparkles,
  Tag,
  Plus,
  Trash2,
  Save,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

const BANKING_TEMPLATES = [
  {
    id: 'auth_admin_login',
    title: 'Admin Sign-In Payload',
    category: 'Authentication',
    scope: 'body',
    description: 'Corporate Super Admin login credentials for authorization tokens.',
    content: JSON.stringify(
      {
        email: 'admin@bankalhabib.com',
        password: 'Admin123!'
      },
      null,
      2
    )
  },
  {
    id: 'auth_user_signup',
    title: 'New Member Registration Payload',
    category: 'Authentication',
    scope: 'body',
    description: 'Standard employee onboarding registration for security clearance.',
    content: JSON.stringify(
      {
        name: 'Tariq Mehmood',
        email: 'tariq.78491@bankalhabib.com',
        password: 'Password123!',
        department: 'Software Engineering',
        role: 'TEAM_MEMBER'
      },
      null,
      2
    )
  },
  {
    id: 'banking_funds_transfer',
    title: 'Interbank Funds Transfer (ISO 20022 pacs.008)',
    category: 'Core Banking',
    scope: 'body',
    description: 'Direct credit transfer with ISO 20022 pacs.008 banking standards.',
    content: JSON.stringify(
      {
        transactionId: 'TXN-2026-BAHL-98214',
        messageType: 'pacs.008.001.08',
        sourceAccount: 'PK36BAHL000123456789',
        destinationAccount: 'PK12HABB000987654321',
        amount: 50000.0,
        currency: 'PKR',
        beneficiaryName: 'Rashid Khan',
        chargeBearer: 'DEBT',
        paymentPurpose: 'INVOICE_SETTLEMENT',
        clearingSystem: 'PRISM_RTGS',
        timestamp: '2026-09-11T12:00:00Z'
      },
      null,
      2
    )
  },
  {
    id: 'banking_balance_inquiry',
    title: 'Account Balance & Ledger Query',
    category: 'Core Banking',
    scope: 'body',
    description: 'Query ledger available and blocked balances across corporate accounts.',
    content: JSON.stringify(
      {
        accountNumber: 'PK36BAHL000123456789',
        currency: 'PKR',
        includeBlockedAmounts: true,
        channel: 'API_GATEWAY_V2'
      },
      null,
      2
    )
  },
  {
    id: 'banking_kyc_verification',
    title: 'KYC & NADRA Verification Request',
    category: 'Core Banking',
    scope: 'body',
    description: 'Customer biometrics and CNIC verification for AML/CFT compliance.',
    content: JSON.stringify(
      {
        cnicNumber: '42101-1234567-1',
        citizenName: 'Muhammad Salman',
        motherMaidenName: 'Fatima',
        verificationType: 'BIOMETRIC_NADRA_VERISYS',
        requestedBy: 'BRANCH_OPS_0012'
      },
      null,
      2
    )
  },
  {
    id: 'headers_banking_security',
    title: 'Corporate Security & Idempotency Headers',
    category: 'Standard Headers',
    scope: 'headers',
    description: 'Enterprise header set including idempotency keys, tenant ID, and trace tokens.',
    content: JSON.stringify(
      [
        { key: 'Content-Type', value: 'application/json', enabled: true },
        { key: 'Accept', value: 'application/json', enabled: true },
        { key: 'X-Idempotency-Key', value: 'IDEM-{{step1_token}}-99182', enabled: true },
        { key: 'X-Correlation-ID', value: 'BAHL-CORR-{{projectId}}-8821', enabled: true },
        { key: 'X-Tenant-ID', value: 'BAHL-PK-CORP', enabled: true }
      ],
      null,
      2
    )
  },
  {
    id: 'headers_iso_standards',
    title: 'ISO 20022 Compliance Headers',
    category: 'Standard Headers',
    scope: 'headers',
    description: 'Standard payment message headers for ISO 20022 compliance.',
    content: JSON.stringify(
      [
        { key: 'X-Message-Format', value: 'ISO-20022-XML-JSON', enabled: true },
        { key: 'X-Clearing-Network', value: 'SBP-PRISM', enabled: true },
        { key: 'X-Financial-Institution-BIC', value: 'BAHLPKKAXXX', enabled: true }
      ],
      null,
      2
    )
  },
  {
    id: 'sdlc_phase_advance',
    title: 'SDLC Phase Approval Payload',
    category: 'SDLC Tasks',
    scope: 'body',
    description: 'Advance current project phase with audit approval notes.',
    content: JSON.stringify(
      {
        currentPhaseId: 2,
        targetPhaseId: 3,
        approvalNotes: 'Security clearance verified by SecOps Lead. Ready for Architecture Review.',
        signoffDepartment: 'Compliance & Risk Governance',
        automatedCheckStatus: 'PASSED'
      },
      null,
      2
    )
  }
];

const CATEGORIES = ['All', 'Authentication', 'Core Banking', 'Standard Headers', 'SDLC Tasks', 'Custom'];

export default function SnippetDrawer({
  isOpen,
  onClose,
  onApplySnippet,
  onInsertVariable,
  runtimeVars = {},
  activeEnv = {},
  isDarkMode = true,
  projectId = 1,
  activeStepName = 'Step 1'
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Custom Snippets State
  const [customSnippets, setCustomSnippets] = useState([]);
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [formError, setFormError] = useState(null);

  // New Snippet Form Fields
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Authentication');
  const [newScope, setNewScope] = useState('body');
  const [newContent, setNewContent] = useState('');

  // Fetch Custom Snippets from Backend
  const fetchCustomSnippets = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoadingCustom(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/projects/${projectId}/api-snippets`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setCustomSnippets(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load custom snippets:', err);
    } finally {
      setIsLoadingCustom(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen) {
      fetchCustomSnippets();
      setShowAddForm(false);
      setFormError(null);
    }
  }, [isOpen, fetchCustomSnippets]);

  // Handle Create Custom Snippet
  const handleCreateCustomSnippet = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Snippet Title is required');
      return;
    }
    if (!newContent.trim()) {
      setFormError('Snippet Code / Content is required');
      return;
    }

    try {
      setIsSavingCustom(true);
      setFormError(null);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/projects/${projectId}/api-snippets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          target_scope: newScope,
          content: newContent.trim()
        })
      });

      if (res.ok) {
        const created = await res.json();
        setCustomSnippets(prev => [created, ...prev]);
        setShowAddForm(false);
        setNewTitle('');
        setNewCategory('Authentication');
        setNewScope('body');
        setNewContent('');
      } else {
        const errData = await res.json().catch(() => ({}));
        setFormError(errData.error || 'Failed to save snippet.');
      }
    } catch (err) {
      console.error('Error saving custom snippet:', err);
      setFormError('Network error saving snippet.');
    } finally {
      setIsSavingCustom(false);
    }
  };

  // Handle Delete Custom Snippet
  const handleDeleteCustomSnippet = async (snippetId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this custom snippet?')) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/projects/${projectId}/api-snippets/${snippetId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setCustomSnippets(prev => prev.filter(s => s.id !== snippetId));
      }
    } catch (err) {
      console.error('Error deleting custom snippet:', err);
    }
  };

  // Combine Built-in + Custom Snippets
  const allSnippets = useMemo(() => {
    const customFormatted = customSnippets.map(cs => ({
      id: `custom_${cs.id}`,
      rawId: cs.id,
      title: cs.title,
      category: cs.category || 'Custom',
      scope: cs.target_scope || 'body',
      description: cs.created_by ? `Created by ${cs.created_by}` : 'Custom Project Snippet',
      content: cs.content,
      isCustom: true
    }));
    return [...customFormatted, ...BANKING_TEMPLATES];
  }, [customSnippets]);

  // Filtered Snippets
  const filteredSnippets = useMemo(() => {
    return allSnippets.filter(s => {
      const matchesCategory = selectedCategory === 'All' 
        ? true 
        : selectedCategory === 'Custom' 
          ? s.isCustom 
          : s.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allSnippets, selectedCategory, searchQuery]);

  const handleCopy = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      {/* Slide-over Drawer Panel */}
      <div className={`w-full sm:w-[480px] md:w-[540px] max-w-full h-full flex flex-col shadow-2xl border-l transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Drawer Header */}
        <div className={`p-3 sm:p-4 border-b flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3 ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold tracking-tight truncate">
                Payload Templates & Snippets
              </h2>
              <p className="text-[10.5px] text-slate-400 truncate">
                Banking payloads, ISO 20022 messages & snippets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* + Add Custom Snippet Button */}
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setFormError(null);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                showAddForm
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30'
                  : isDarkMode
                    ? 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/50'
                    : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <Plus size={14} />
              <span>{showAddForm ? 'Close Form' : 'Add Custom'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Drawer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Custom Snippet Creator Form Modal / Inline Box */}
        {showAddForm && (
          <div className={`p-3.5 sm:p-4 border-b transition-all ${
            isDarkMode ? 'bg-purple-950/20 border-purple-900/40' : 'bg-purple-50/70 border-purple-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold flex items-center gap-1.5 text-purple-400">
                <PlusCircle size={14} />
                <span>Create Custom Snippet</span>
              </h3>
              <span className="text-[10px] text-slate-400">Saved to Project #{projectId}</span>
            </div>

            <form onSubmit={handleCreateCustomSnippet} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Snippet Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Account Balance Verification Payload"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full text-xs font-semibold px-3 py-2 rounded-lg border focus:outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className={`w-full text-xs font-semibold px-2.5 py-2 rounded-lg border focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Authentication">Authentication</option>
                    <option value="Core Banking">Core Banking</option>
                    <option value="Standard Headers">Standard Headers</option>
                    <option value="SDLC Tasks">SDLC Tasks</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Target Scope
                  </label>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    className={`w-full text-xs font-semibold px-2.5 py-2 rounded-lg border focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="body">Request Body (JSON)</option>
                    <option value="headers">HTTP Headers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Code / Content Area
                </label>
                <textarea
                  rows={6}
                  placeholder={newScope === 'body' ? '{\n  "accountNumber": "PK36BAHL000123456789",\n  "amount": 5000\n}' : '[\n  {"key": "X-Custom-Header", "value": "Value123", "enabled": true}\n]'}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className={`w-full p-2.5 font-mono text-xs rounded-lg border resize-none focus:outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {formError && (
                <div className="p-2 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertCircle size={13} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustom}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md transition-all"
                >
                  <Save size={13} />
                  <span>{isSavingCustom ? 'Saving...' : 'Save Snippet'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-800/80">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates (e.g., transfer, login, token, ISO 20022)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className={`px-3 py-2 border-b flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none ${
          isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
        }`}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-sm'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {cat}
              {cat === 'Custom' && customSnippets.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full bg-purple-800 text-white">
                  {customSnippets.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Snippets List */}
        <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
          {filteredSnippets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Code2 size={28} className="mb-2 opacity-40" />
              <p className="text-xs font-semibold">No snippets found</p>
              <p className="text-[11px] text-slate-600 mt-1">
                {selectedCategory === 'Custom' 
                  ? 'No custom snippets created yet for this project. Click "+ Add Custom Snippet" to add one.'
                  : 'Try selecting a different category or clearing search filters.'}
              </p>
            </div>
          ) : (
            filteredSnippets.map(snippet => {
              const isScopeHeaders = snippet.scope === 'headers';
              return (
                <div
                  key={snippet.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700' 
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                        isScopeHeaders 
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}>
                        {isScopeHeaders ? 'HEADERS' : 'JSON BODY'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">• {snippet.category}</span>
                      {snippet.isCustom && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                          Custom
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Copy Action */}
                      <button
                        onClick={() => handleCopy(snippet.id, snippet.content)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                          isDarkMode 
                            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                        title="Copy to clipboard"
                      >
                        {copiedId === snippet.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedId === snippet.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      {/* 1-Click Insert Action */}
                      <button
                        onClick={() => {
                          onApplySnippet(snippet);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-sm transition-all"
                        title={`Insert snippet into active step`}
                      >
                        <ArrowDownToLine size={12} />
                        <span>Insert</span>
                      </button>

                      {/* Delete button if custom */}
                      {snippet.isCustom && (
                        <button
                          onClick={(e) => handleDeleteCustomSnippet(snippet.rawId, e)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30"
                          title="Delete custom snippet"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-200 mt-1">{snippet.title}</h3>
                  <p className="text-[11px] text-slate-400 mb-2">{snippet.description}</p>

                  <pre className={`p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto max-h-36 border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800/80 text-slate-300' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    {snippet.content}
                  </pre>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Bar: Available Dynamic Variable Insertion Chips */}
        <div className={`p-3 border-t flex flex-col gap-2 ${
          isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-purple-400" />
              <span>Available Dynamic Variables (Click to Insert)</span>
            </span>
            <span className="text-[10px] font-mono">
              {Object.keys(runtimeVars).length + Object.keys(activeEnv?.variables || {}).length} Variables
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {Object.keys(activeEnv?.variables || {}).map(k => (
              <button
                key={k}
                onClick={() => onInsertVariable(k)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-900 border-purple-900/40 text-purple-300 hover:bg-purple-950/60' 
                    : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50'
                }`}
              >
                + {`{{${k}}}`}
              </button>
            ))}
            {Object.keys(runtimeVars).map(k => (
              <button
                key={k}
                onClick={() => onInsertVariable(k)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border transition-all ${
                  isDarkMode 
                    ? 'bg-purple-950 border-purple-700/60 text-emerald-300 hover:bg-purple-900' 
                    : 'bg-purple-100 border-purple-300 text-emerald-700 hover:bg-purple-200'
                }`}
              >
                + {`{{${k}}}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
