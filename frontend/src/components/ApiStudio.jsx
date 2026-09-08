import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Copy,
  Check,
  Plus,
  Trash2,
  Settings2,
  Terminal,
  Code2,
  ChevronRight,
  RefreshCw,
  Zap,
  Layers,
  Sparkles,
  Database,
  Globe,
  Save,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Edit2,
  AlertCircle,
  FolderGit2,
  CheckCheck
} from 'lucide-react';
import bahlLogo from '../assets/bahl-logo.png';

const METHOD_COLORS = {
  GET: {
    bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    btn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    badge: 'text-emerald-500 font-black'
  },
  POST: {
    bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    btn: 'bg-blue-600 hover:bg-blue-500 text-white',
    badge: 'text-blue-500 font-black'
  },
  PUT: {
    bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    btn: 'bg-amber-600 hover:bg-amber-500 text-white',
    badge: 'text-amber-500 font-black'
  },
  PATCH: {
    bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    btn: 'bg-purple-600 hover:bg-purple-500 text-white',
    badge: 'text-purple-500 font-black'
  },
  DELETE: {
    bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    btn: 'bg-rose-600 hover:bg-rose-500 text-white',
    badge: 'text-rose-500 font-black'
  }
};

const createDefaultStep = (stepNumber) => ({
  id: 'step_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
  name: `Step ${stepNumber}: Custom Endpoint`,
  method: 'GET',
  url: '{{baseUrl}}/projects',
  headers: [
    { id: 'h1', enabled: true, key: 'Authorization', value: 'Bearer {{step1_token}}' },
    { id: 'h2', enabled: true, key: 'Accept', value: 'application/json' }
  ],
  params: [],
  body: '',
  extractionRules: []
});

export default function ApiStudio({ onBack, isDarkMode, authUser, activeProject, projects, onSelectProject }) {
  // Current active project binding
  const currentProject = activeProject || (projects && projects.length > 0 ? projects[0] : { id: 1, name: 'Core Banking Modernization' });
  const projectId = currentProject?.id || 1;

  // Environments State (Project-scoped)
  const [environments, setEnvironments] = useState([]);
  const [activeEnvId, setActiveEnvId] = useState(null);
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [isLoadingEnvs, setIsLoadingEnvs] = useState(false);
  const [envSaveStatus, setEnvSaveStatus] = useState(null);
  const [newEnvName, setNewEnvName] = useState('');
  const [isCreatingEnv, setIsCreatingEnv] = useState(false);

  // Multi-Phase Dynamic Pipeline Steps State (Project-scoped)
  const [steps, setSteps] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(false);
  const [isSavingPipeline, setIsSavingPipeline] = useState(false);
  const [pipelineSaveStatus, setPipelineSaveStatus] = useState(null);

  // Runtime extracted variables from chained pipeline or single execution
  const [runtimeVars, setRuntimeVars] = useState({});

  // Execution results keyed by step.id
  const [stepResults, setStepResults] = useState({});
  const [executingStepIndex, setExecutingStepIndex] = useState(null);

  // Request sub-tab in workspace: 'params' | 'headers' | 'body' | 'extraction'
  const [reqTab, setReqTab] = useState('body');

  // Response sub-tab: 'body' | 'headers' | 'extracted'
  const [resTab, setResTab] = useState('body');

  // Chained Pipeline Runner state
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [pipelineLogs, setPipelineLogs] = useState([]);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Active step object
  const activeStep = steps[activeStepIndex] || steps[0] || null;
  const currentResult = activeStep ? stepResults[activeStep.id] : null;

  // Active Environment object
  const activeEnv = environments.find(e => e.id === activeEnvId) || environments[0] || {
    id: 0,
    name: 'Local Backend',
    variables: [{ key: 'baseUrl', value: 'http://127.0.0.1:5000/api' }]
  };

  // Helper to extract nested value from object via path like 'user.id' or 'token'
  const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;
    const parts = path.split('.');
    let curr = obj;
    for (const part of parts) {
      if (curr && typeof curr === 'object' && part in curr) {
        curr = curr[part];
      } else {
        return undefined;
      }
    }
    return curr;
  };

  // Fetch Project-Scoped Environments
  const loadEnvironments = useCallback(async (targetProjectId) => {
    setIsLoadingEnvs(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://127.0.0.1:5000/api/projects/${targetProjectId}/api-environments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const envList = Array.isArray(data) ? data : (data.environments || (data.environment ? [data.environment] : []));
      if (envList && envList.length > 0) {
        setEnvironments(envList);
        const defaultEnv = envList.find(e => e.is_default) || envList[0];
        setActiveEnvId(prev => {
          const exists = envList.some(e => e.id === prev);
          return exists ? prev : defaultEnv.id;
        });
      }
    } catch (err) {
      console.error('Failed to load environments for project:', err);
    } finally {
      setIsLoadingEnvs(false);
    }
  }, []);

  // Fetch Project-Scoped Pipeline Steps
  const loadPipeline = useCallback(async (targetProjectId) => {
    setIsLoadingPipeline(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://127.0.0.1:5000/api/projects/${targetProjectId}/api-pipeline`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const pipe = data.pipeline || data;
      if (pipe && pipe.steps && Array.isArray(pipe.steps) && pipe.steps.length > 0) {
        setSteps(pipe.steps);
        setActiveStepIndex(0);
      }
    } catch (err) {
      console.error('Failed to load API pipeline for project:', err);
    } finally {
      setIsLoadingPipeline(false);
    }
  }, []);

  // Load environments and pipeline whenever active project changes
  useEffect(() => {
    if (projectId) {
      loadEnvironments(projectId);
      loadPipeline(projectId);
      setRuntimeVars({});
      setStepResults({});
      setPipelineLogs([]);
    }
  }, [projectId, loadEnvironments, loadPipeline]);

  // Save Pipeline to Backend
  const handleSavePipeline = async () => {
    setIsSavingPipeline(true);
    setPipelineSaveStatus(null);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://127.0.0.1:5000/api/projects/${projectId}/api-pipeline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Project API Pipeline',
          steps: steps
        })
      });
      const data = await res.json();
      if (res.ok && (data.steps || data.pipeline || data.success)) {
        setPipelineSaveStatus({ type: 'success', msg: 'Pipeline saved successfully!' });
      } else {
        setPipelineSaveStatus({ type: 'error', msg: data.error || data.message || 'Failed to save pipeline' });
      }
    } catch (err) {
      setPipelineSaveStatus({ type: 'error', msg: err.message });
    } finally {
      setIsSavingPipeline(false);
      setTimeout(() => setPipelineSaveStatus(null), 3000);
    }
  };

  // Reset Pipeline to Default Template
  const handleResetPipeline = async () => {
    if (!window.confirm("Reset this project's API Pipeline to the default 2-Step template?")) {
      return;
    }
    setIsLoadingPipeline(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://127.0.0.1:5000/api/projects/${projectId}/api-pipeline/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      const pipe = data.pipeline || data;
      if (pipe && pipe.steps) {
        setSteps(pipe.steps);
        setActiveStepIndex(0);
        setStepResults({});
        setRuntimeVars({});
        setPipelineSaveStatus({ type: 'success', msg: 'Reset to default template!' });
      }
    } catch (err) {
      console.error('Failed to reset pipeline:', err);
    } finally {
      setIsLoadingPipeline(false);
      setTimeout(() => setPipelineSaveStatus(null), 3000);
    }
  };

  // Add a New Step / Phase
  const handleAddStep = () => {
    const newStep = createDefaultStep(steps.length + 1);
    const updatedSteps = [...steps, newStep];
    setSteps(updatedSteps);
    setActiveStepIndex(updatedSteps.length - 1);
  };

  // Delete a Step
  const handleDeleteStep = (indexToDelete, e) => {
    if (e) e.stopPropagation();
    if (steps.length <= 1) {
      alert('Pipeline must have at least one step.');
      return;
    }
    if (window.confirm(`Delete Step ${indexToDelete + 1} (${steps[indexToDelete].name})?`)) {
      const updatedSteps = steps.filter((_, idx) => idx !== indexToDelete);
      setSteps(updatedSteps);
      if (activeStepIndex >= updatedSteps.length) {
        setActiveStepIndex(updatedSteps.length - 1);
      } else if (activeStepIndex === indexToDelete) {
        setActiveStepIndex(Math.max(0, indexToDelete - 1));
      }
    }
  };

  // Move Step Up
  const handleMoveStepUp = (index, e) => {
    if (e) e.stopPropagation();
    if (index === 0) return;
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setSteps(updated);
    setActiveStepIndex(index - 1);
  };

  // Move Step Down
  const handleMoveStepDown = (index, e) => {
    if (e) e.stopPropagation();
    if (index === steps.length - 1) return;
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setSteps(updated);
    setActiveStepIndex(index + 1);
  };

  // Update a specific field in the active step
  const updateActiveStep = (updater) => {
    setSteps(prev => {
      const updated = [...prev];
      if (typeof updater === 'function') {
        updated[activeStepIndex] = updater(updated[activeStepIndex]);
      } else {
        updated[activeStepIndex] = { ...updated[activeStepIndex], ...updater };
      }
      return updated;
    });
  };

  // Create a New Custom Environment
  const handleCreateEnvironment = async () => {
    if (!newEnvName.trim()) return;
    setIsCreatingEnv(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://127.0.0.1:5000/api/projects/${projectId}/api-environments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newEnvName.trim(),
          variables: [
            { key: 'baseUrl', value: 'http://127.0.0.1:5000/api' },
            { key: 'apiKey', value: 'bahl_custom_key_123' }
          ]
        })
      });
      const data = await res.json();
      const newEnv = data.environment || data;
      if (newEnv && newEnv.id) {
        setEnvironments(prev => [...prev, newEnv]);
        setActiveEnvId(newEnv.id);
        setNewEnvName('');
      }
    } catch (err) {
      console.error('Failed to create environment:', err);
    } finally {
      setIsCreatingEnv(false);
    }
  };

  // Save Environment Variables to Backend
  const handleSaveEnvironment = async (envToSave) => {
    setEnvSaveStatus({ envId: envToSave.id, status: 'saving' });
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://127.0.0.1:5000/api/projects/${projectId}/api-environments/${envToSave.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: envToSave.name,
          variables: envToSave.variables
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEnvSaveStatus({ envId: envToSave.id, status: 'success', msg: 'Environment variables saved!' });
      } else {
        setEnvSaveStatus({ envId: envToSave.id, status: 'error', msg: data.error || data.message || 'Save failed' });
      }
    } catch (err) {
      setEnvSaveStatus({ envId: envToSave.id, status: 'error', msg: err.message });
    } finally {
      setTimeout(() => setEnvSaveStatus(null), 2500);
    }
  };

  // Delete Environment
  const handleDeleteEnvironment = async (envId) => {
    if (environments.length <= 1) {
      alert('Cannot delete the last remaining environment.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this environment?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://127.0.0.1:5000/api/projects/${projectId}/api-environments/${envId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const remaining = environments.filter(e => e.id !== envId);
        setEnvironments(remaining);
        if (activeEnvId === envId) {
          setActiveEnvId(remaining[0]?.id || null);
        }
      }
    } catch (err) {
      console.error('Failed to delete environment:', err);
    }
  };

  // Execute a single step
  const executeStep = async (stepIndex, customRuntime = runtimeVars) => {
    const step = steps[stepIndex];
    if (!step) return { success: false };

    setExecutingStepIndex(stepIndex);

    try {
      // 1. Resolve URL with variables
      let resolvedUrl = (step.url || '').replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (m, key) => {
        if (customRuntime[key] !== undefined) return customRuntime[key];
        const v = activeEnv?.variables?.find(item => item.key === key);
        return v ? v.value : m;
      });

      // 2. Resolve Headers
      const resolvedHeaders = {};
      (step.headers || []).filter(h => h.enabled && h.key && h.key.trim()).forEach(h => {
        const resolvedVal = (h.value || '').replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (m, key) => {
          if (customRuntime[key] !== undefined) return customRuntime[key];
          const v = activeEnv?.variables?.find(item => item.key === key);
          return v ? v.value : m;
        });
        resolvedHeaders[h.key.trim()] = resolvedVal;
      });

      // 3. Resolve Query Params
      const resolvedParams = {};
      (step.params || []).filter(p => p.enabled && p.key && p.key.trim()).forEach(p => {
        const resolvedVal = (p.value || '').replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (m, key) => {
          if (customRuntime[key] !== undefined) return customRuntime[key];
          const v = activeEnv?.variables?.find(item => item.key === key);
          return v ? v.value : m;
        });
        resolvedParams[p.key.trim()] = resolvedVal;
      });

      // 4. Resolve Body
      let resolvedBody = null;
      if (step.method !== 'GET' && step.body) {
        let bodyStr = (step.body || '').replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (m, key) => {
          if (customRuntime[key] !== undefined) return customRuntime[key];
          const v = activeEnv?.variables?.find(item => item.key === key);
          return v ? v.value : m;
        });
        try {
          resolvedBody = JSON.parse(bodyStr);
        } catch {
          resolvedBody = bodyStr;
        }
      }

      // Dispatch to backend proxy
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://127.0.0.1:5000/api/proxy/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          method: step.method,
          url: resolvedUrl,
          headers: resolvedHeaders,
          params: resolvedParams,
          body: resolvedBody
        })
      });

      const data = await res.json();
      setStepResults(prev => ({ ...prev, [step.id]: data }));

      // Extract variables if rules defined and response succeeded
      let updatedRuntime = { ...customRuntime };
      if (data.status_code >= 200 && data.status_code < 300 && step.extractionRules && step.extractionRules.length > 0) {
        step.extractionRules.forEach(rule => {
          if (rule.targetVar && rule.sourcePath) {
            const val = getNestedValue(data.data, rule.sourcePath);
            if (val !== undefined) {
              updatedRuntime[rule.targetVar] = val;
            }
          }
        });
        setRuntimeVars(updatedRuntime);
      }

      const isSuccess = data.status_code >= 200 && data.status_code < 300;
      return { success: isSuccess, data, extracted: updatedRuntime };

    } catch (err) {
      const errPayload = {
        status_code: 500,
        status_text: 'Client Execution Failed',
        time_ms: 0,
        size_bytes: 0,
        headers: {},
        data: { error: err.message },
        is_json: true
      };
      setStepResults(prev => ({ ...prev, [step.id]: errPayload }));
      return { success: false, data: errPayload, extracted: customRuntime };
    } finally {
      setExecutingStepIndex(null);
    }
  };

  // Headless Multi-Step Automated Chained Pipeline Runner
  const runChainedPipeline = async () => {
    if (steps.length === 0) return;
    setIsRunningPipeline(true);
    setPipelineLogs([]);

    const addLog = (msg, type = 'info') => {
      setPipelineLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);
    };

    addLog(`🚀 Initializing Multi-Phase Chained Pipeline for Project: "${currentProject.name}"`, 'info');
    addLog(`Environment: ${activeEnv.name} | Total Pipeline Steps: ${steps.length}`, 'info');

    let currentContext = { ...runtimeVars };

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      addLog(`----------------------------------------`, 'info');
      addLog(`▶ Executing Step ${i + 1}/${steps.length}: [${step.method}] ${step.name}`, 'info');
      setActiveStepIndex(i);

      const result = await executeStep(i, currentContext);

      if (!result.success) {
        addLog(`❌ Step ${i + 1} FAILED with HTTP ${result.data?.status_code || 500} (${result.data?.status_text || 'Error'}).`, 'error');
        addLog(`⛔ Pipeline halted at Step ${i + 1}. Subsequent steps will NOT be executed.`, 'error');
        setIsRunningPipeline(false);
        return;
      }

      addLog(`✓ Step ${i + 1} Succeeded! HTTP ${result.data.status_code} in ${result.data.time_ms}ms.`, 'success');

      // Check variable extractions
      if (step.extractionRules && step.extractionRules.length > 0) {
        step.extractionRules.forEach(r => {
          if (r.targetVar && result.extracted[r.targetVar] !== undefined) {
            const previewVal = String(result.extracted[r.targetVar]);
            addLog(`  • Extracted {{${r.targetVar}}}: ${previewVal.length > 25 ? previewVal.substring(0, 25) + '...' : previewVal}`, 'success');
          } else if (r.targetVar) {
            addLog(`  ⚠ Extraction warning: Path "${r.sourcePath}" not found in response for {{${r.targetVar}}}`, 'error');
          }
        });
      }

      currentContext = { ...result.extracted };

      // Small sequential pause for visual tracking
      if (i < steps.length - 1) {
        await new Promise(r => setTimeout(r, 450));
      }
    }

    addLog(`----------------------------------------`, 'info');
    addLog(`🎉 Chained Pipeline completed successfully across all ${steps.length} steps with 100% data integrity!`, 'success');
    setIsRunningPipeline(false);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0b0c16] text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* TOP STUDIO NAVIGATION & CONTROL BAR */}
      <header className={`h-14 border-b px-4 flex items-center justify-between shrink-0 transition z-10 ${
        isDarkMode ? 'bg-[#121422] border-zinc-800/80' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        {/* Left Section: Back button, Logo, Project Scope Selector */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className={`flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
              isDarkMode 
                ? 'bg-zinc-850 hover:bg-zinc-800 border-zinc-750 text-zinc-200' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 shadow-2xs'
            }`}
            title="Return to SDLC Governance Board"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Board</span>
          </button>

          <div className="h-4 w-px bg-zinc-700/50" />

          {/* Logo & Studio Branding */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-white/95 border border-emerald-500/30 p-0.5 flex items-center justify-center shadow-xs">
              <img src={bahlLogo} alt="Bank AL Habib" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight">API Execution Studio</span>
                <span className="text-[9.5px] font-black tracking-wider uppercase px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  Project Bound
                </span>
              </div>
            </div>
          </div>

          <div className="h-4 w-px bg-zinc-700/50 hidden md:block" />

          {/* Active Project Selector */}
          <div className="hidden md:flex items-center space-x-1.5">
            <FolderGit2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            <span className="text-[11px] font-bold text-zinc-400">Project:</span>
            {projects && projects.length > 0 ? (
              <select
                value={projectId}
                onChange={e => {
                  const selected = projects.find(p => p.id === parseInt(e.target.value));
                  if (selected && onSelectProject) onSelectProject(selected);
                }}
                className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-hidden cursor-pointer max-w-[180px] truncate ${
                  isDarkMode ? 'bg-[#181a30] border-zinc-750 text-purple-300' : 'bg-slate-100 border-slate-300 text-purple-800'
                }`}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-slate-900'}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-bold text-purple-400 truncate max-w-[160px]">{currentProject?.name}</span>
            )}
          </div>
        </div>

        {/* Right Section: Environment Switcher, Pipeline Actions, Run Pipeline */}
        <div className="flex items-center space-x-2">
          
          {/* Status Feedback Toast */}
          {pipelineSaveStatus && (
            <div className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 border animate-fade-in ${
              pipelineSaveStatus.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}>
              {pipelineSaveStatus.type === 'success' ? <CheckCheck className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              <span>{pipelineSaveStatus.msg}</span>
            </div>
          )}

          {/* Environment Switcher Dropdown & Settings */}
          <div className="flex items-center space-x-1">
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs ${
              isDarkMode ? 'bg-[#16182a] border-zinc-800 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <Globe className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              {isLoadingEnvs ? (
                <span className="text-[11px] text-zinc-400">Loading...</span>
              ) : (
                <select
                  value={activeEnvId || ''}
                  onChange={e => setActiveEnvId(parseInt(e.target.value) || e.target.value)}
                  className="bg-transparent font-bold text-xs focus:outline-hidden cursor-pointer max-w-[130px] truncate"
                >
                  {environments.map(env => (
                    <option key={env.id} value={env.id} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-slate-900'}>
                      {env.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={() => setShowEnvModal(true)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isDarkMode ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
              title="Manage Environments & Variables"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-zinc-700/50 hidden sm:block" />

          {/* Reset to Defaults Button */}
          <button
            onClick={handleResetPipeline}
            disabled={isLoadingPipeline || isRunningPipeline}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
              isDarkMode ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'border-slate-300 hover:bg-slate-100 text-slate-600'
            }`}
            title="Reset Pipeline to Default Template"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Reset</span>
          </button>

          {/* Save Pipeline Button */}
          <button
            onClick={handleSavePipeline}
            disabled={isSavingPipeline || isLoadingPipeline}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border flex items-center space-x-1 transition cursor-pointer ${
              isDarkMode 
                ? 'bg-zinc-850 hover:bg-zinc-800 border-purple-500/40 text-purple-300' 
                : 'bg-white hover:bg-purple-50 border-purple-300 text-purple-700 shadow-2xs'
            }`}
            title="Persist Pipeline Configuration for Current Project"
          >
            {isSavingPipeline ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 text-purple-400" />}
            <span className="hidden sm:inline">Save Pipeline</span>
          </button>

          {/* Run Chained Pipeline Button */}
          <button
            onClick={runChainedPipeline}
            disabled={isRunningPipeline || steps.length === 0}
            className={`text-xs font-black px-3.5 py-1.5 rounded-xl border flex items-center space-x-1.5 transition shadow-sm cursor-pointer ${
              isRunningPipeline
                ? 'bg-purple-700 text-white opacity-80 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400/30 shadow-purple-950/40'
            }`}
            title="Execute All Pipeline Phases Sequentially with Variable Injection"
          >
            {isRunningPipeline ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Running ({steps.length} Steps)...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Run Chained Pipeline</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* MAIN STUDIO WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR: Dynamic Multi-Phase Pipeline Navigator */}
        <aside className={`w-72 sm:w-80 border-r flex flex-col shrink-0 overflow-y-auto ${
          isDarkMode ? 'bg-[#101220] border-zinc-800/80' : 'bg-white border-slate-200'
        }`}>
          
          {/* Pipeline Header with Step Count & Add Step Button */}
          <div className="p-3 border-b flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Layers className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Pipeline Phases</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/40 px-1.5 py-0.5 rounded">
                {steps.length} {steps.length === 1 ? 'Step' : 'Steps'}
              </span>
              <button
                onClick={handleAddStep}
                className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/15 p-1 rounded-lg transition flex items-center gap-0.5 font-bold cursor-pointer"
                title="Add New Phase / Step"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="text-[11px]">Add Step</span>
              </button>
            </div>
          </div>

          {/* Sequential Steps List (NO HARD LOCKS - FULLY CLICKABLE & EDITABLE) */}
          <div className="p-3 space-y-2">
            {isLoadingPipeline ? (
              <div className="py-8 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
                <span>Loading Project Pipeline...</span>
              </div>
            ) : steps.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                <p>No steps in pipeline.</p>
                <button
                  onClick={handleAddStep}
                  className="mt-2 text-purple-400 hover:underline font-bold"
                >
                  + Add First Step
                </button>
              </div>
            ) : (
              steps.map((step, idx) => {
                const stepResult = stepResults[step.id];
                const isSuccess = stepResult && stepResult.status_code >= 200 && stepResult.status_code < 300;
                const isSelected = activeStepIndex === idx;
                const isExecutingThis = executingStepIndex === idx;

                return (
                  <React.Fragment key={step.id || idx}>
                    {/* Linker arrow between steps */}
                    {idx > 0 && (
                      <div className="flex items-center justify-center py-0.5">
                        <div className="flex items-center space-x-1 text-[9.5px] font-bold text-zinc-500 uppercase tracking-widest">
                          <ChevronRight className="h-2.5 w-2.5 rotate-90" />
                          <span>Injects Context</span>
                        </div>
                      </div>
                    )}

                    {/* Step Card Item */}
                    <div
                      id={`pipeline-step-${idx + 1}`}
                      onClick={() => setActiveStepIndex(idx)}
                      className={`p-3 rounded-xl border transition cursor-pointer group relative ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-[#181a30] border-purple-500/60 shadow-md shadow-purple-950/30 ring-1 ring-purple-500/20'
                            : 'bg-violet-50/90 border-violet-400 shadow-xs ring-1 ring-violet-400/20'
                          : isDarkMode
                            ? 'bg-[#141626] border-zinc-800/80 hover:border-zinc-700'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-black border uppercase tracking-wider shrink-0 ${METHOD_COLORS[step.method]?.bg || 'bg-zinc-800'}`}>
                            {step.method}
                          </span>
                          <span className="text-xs font-extrabold truncate">
                            {step.name || `Step ${idx + 1}`}
                          </span>
                        </div>

                        {/* Status badge or executing spinner */}
                        <div className="flex items-center space-x-1 shrink-0">
                          {isExecutingThis ? (
                            <RefreshCw className="h-3 w-3 animate-spin text-purple-400" />
                          ) : isSuccess ? (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{stepResult.status_code}</span>
                            </span>
                          ) : stepResult ? (
                            <span className="text-[10px] font-bold text-rose-400 flex items-center gap-0.5">
                              <XCircle className="h-3 w-3" />
                              <span>{stepResult.status_code}</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold text-zinc-500 uppercase">Ready</span>
                          )}
                        </div>
                      </div>

                      {/* Step URL Preview */}
                      <p className="text-[10.5px] text-zinc-400 truncate mt-1 font-mono">
                        {step.url || 'No URL specified'}
                      </p>

                      {/* Step Footer: Extraction info & Reorder / Delete Actions */}
                      <div className="mt-2 pt-2 border-t border-zinc-800/40 flex items-center justify-between text-[10px]">
                        <div className="flex items-center space-x-2">
                          {step.extractionRules && step.extractionRules.length > 0 ? (
                            <span className="text-purple-400 font-semibold flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5" />
                              <span>Extracts: {step.extractionRules.length}</span>
                            </span>
                          ) : (
                            <span className="text-zinc-500">No extractions</span>
                          )}
                        </div>

                        {/* Reorder and Delete Controls */}
                        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                          {idx > 0 && (
                            <button
                              onClick={(e) => handleMoveStepUp(idx, e)}
                              className="p-1 hover:text-purple-400 text-zinc-500 rounded cursor-pointer"
                              title="Move step up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                          )}
                          {idx < steps.length - 1 && (
                            <button
                              onClick={(e) => handleMoveStepDown(idx, e)}
                              className="p-1 hover:text-purple-400 text-zinc-500 rounded cursor-pointer"
                              title="Move step down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          )}
                          {steps.length > 1 && (
                            <button
                              onClick={(e) => handleDeleteStep(idx, e)}
                              className="p-1 hover:text-rose-400 text-zinc-500 rounded cursor-pointer"
                              title="Delete this step"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}

            {/* Bottom Add Step Quick Button */}
            {!isLoadingPipeline && steps.length > 0 && (
              <button
                onClick={handleAddStep}
                className={`w-full py-2 border border-dashed rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                  isDarkMode 
                    ? 'border-zinc-800 text-zinc-400 hover:border-purple-500/50 hover:text-purple-300 hover:bg-purple-950/20' 
                    : 'border-slate-300 text-slate-600 hover:border-purple-400 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Phase / Step</span>
              </button>
            )}
          </div>

          {/* DYNAMIC RUNTIME CONTEXT VARIABLES INSPECTOR */}
          <div className="p-3.5 border-t border-zinc-800/60 mt-auto space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Database className="h-3 w-3 text-purple-400" />
                <span>Runtime Context</span>
              </span>
              {Object.keys(runtimeVars).length > 0 && (
                <button
                  onClick={() => setRuntimeVars({})}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                  title="Clear runtime variables"
                >
                  Clear
                </button>
              )}
            </div>

            {Object.keys(runtimeVars).length === 0 ? (
              <p className="text-[11px] text-zinc-500 italic p-2 rounded bg-zinc-900/30 border border-dashed border-zinc-800">
                No variables extracted yet. Execute steps to populate dynamic token and IDs.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {Object.entries(runtimeVars).map(([k, v]) => (
                  <div key={k} className="p-2 rounded-lg bg-purple-950/25 border border-purple-800/30 text-xs">
                    <span className="font-mono text-[10px] font-bold text-purple-400 block truncate">{`{{${k}}}`}</span>
                    <span className="font-mono text-[10px] text-zinc-300 block truncate mt-0.5">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LIVE EXECUTION CONSOLE DRAWER */}
          {pipelineLogs.length > 0 && (
            <div className={`p-3 border-t text-xs font-mono max-h-48 overflow-y-auto ${
              isDarkMode ? 'bg-[#090a12]' : 'bg-slate-100'
            }`}>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-bold mb-1.5">
                <span>Execution Log</span>
                <button onClick={() => setPipelineLogs([])} className="hover:text-zinc-200">Clear</button>
              </div>
              <div className="space-y-1">
                {pipelineLogs.map((log, idx) => (
                  <div key={idx} className={`text-[10px] leading-relaxed ${
                    log.type === 'error' ? 'text-rose-400 font-bold' : log.type === 'success' ? 'text-emerald-400' : 'text-zinc-400'
                  }`}>
                    <span className="text-zinc-600 mr-1">[{log.time}]</span>
                    {log.msg}
                  </div>
                ))}
              </div>
            </div>
          )}

        </aside>

        {/* WORKSPACE AREA: REQUEST BUILDER (LEFT) & RESPONSE VIEWER (RIGHT) */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {activeStep ? (
            <>
              {/* LEFT HALF: REQUEST BUILDER */}
              <section className="flex-1 flex flex-col border-b md:border-b-0 md:border-r overflow-hidden">
                
                {/* Step Title & Method & URL Address Bar */}
                <div className={`p-3 border-b space-y-2.5 ${
                  isDarkMode ? 'bg-[#121424] border-zinc-800/80' : 'bg-slate-100/70 border-slate-200'
                }`}>
                  
                  {/* Step Title Header (Editable Name) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 mr-2">
                      <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">
                        Phase #{activeStepIndex + 1}:
                      </span>
                      <input
                        type="text"
                        value={activeStep.name || ''}
                        onChange={e => updateActiveStep({ name: e.target.value })}
                        placeholder="Step Name / Purpose..."
                        className={`text-xs font-bold px-2 py-1 rounded-lg border flex-1 transition ${
                          isDarkMode 
                            ? 'bg-[#0f101d] border-zinc-750 text-zinc-100 focus:border-purple-500' 
                            : 'bg-white border-slate-300 text-slate-900 focus:border-purple-500'
                        }`}
                      />
                    </div>

                    <span className="text-[10px] font-mono text-zinc-500">
                      ID: {activeStep.id.substring(0, 10)}
                    </span>
                  </div>

                  {/* Method Selector, URL Input & Send Button */}
                  <div className="flex items-center space-x-2">
                    {/* Method Selector */}
                    <select
                      value={activeStep.method}
                      onChange={e => updateActiveStep({ method: e.target.value })}
                      className={`font-black text-xs px-3 py-2 rounded-xl border focus:outline-hidden cursor-pointer ${METHOD_COLORS[activeStep.method]?.bg || 'bg-zinc-800'}`}
                    >
                      {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                        <option key={m} value={m} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-slate-900'}>
                          {m}
                        </option>
                      ))}
                    </select>

                    {/* URL Input */}
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={activeStep.url || ''}
                        onChange={e => updateActiveStep({ url: e.target.value })}
                        placeholder="Enter request URL with {{variable}}..."
                        className={`w-full text-xs font-mono px-3 py-2 rounded-xl border focus:outline-hidden focus:ring-2 transition ${
                          isDarkMode 
                            ? 'bg-[#0f101d] border-zinc-750 text-zinc-100 focus:ring-purple-500/30' 
                            : 'bg-white border-slate-300 text-slate-900 focus:ring-violet-500/20 shadow-2xs'
                        }`}
                      />
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={() => executeStep(activeStepIndex)}
                      disabled={executingStepIndex === activeStepIndex}
                      className={`text-xs font-black px-4 py-2 rounded-xl border flex items-center space-x-1.5 transition shadow-sm cursor-pointer ${
                        executingStepIndex === activeStepIndex
                          ? 'opacity-60 cursor-not-allowed'
                          : METHOD_COLORS[activeStep.method]?.btn || 'bg-purple-600'
                      }`}
                    >
                      {executingStepIndex === activeStepIndex ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className={`flex items-center px-3 border-b text-xs space-x-4 ${
                  isDarkMode ? 'bg-[#101220] border-zinc-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  {[
                    { id: 'body', label: 'Body' },
                    { id: 'headers', label: `Headers (${(activeStep.headers || []).filter(h => h.enabled).length})` },
                    { id: 'params', label: `Params (${(activeStep.params || []).filter(p => p.enabled).length})` },
                    { id: 'extraction', label: `Variable Extraction (${(activeStep.extractionRules || []).length})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setReqTab(tab.id)}
                      className={`py-2.5 font-bold border-b-2 transition cursor-pointer ${
                        reqTab === tab.id
                          ? 'border-purple-500 text-purple-400'
                          : 'border-transparent text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div className="flex-1 p-3.5 overflow-y-auto">
                  
                  {/* BODY TAB */}
                  {reqTab === 'body' && (
                    <div className="h-full flex flex-col space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>JSON (application/json) with interpolation support:</span>
                        <button
                          onClick={() => {
                            try {
                              const parsed = JSON.parse(activeStep.body);
                              const formatted = JSON.stringify(parsed, null, 2);
                              updateActiveStep({ body: formatted });
                            } catch {
                              // Ignore parse error
                            }
                          }}
                          className="text-purple-400 hover:underline cursor-pointer font-semibold"
                        >
                          Prettify JSON
                        </button>
                      </div>

                      <textarea
                        value={activeStep.body || ''}
                        onChange={e => updateActiveStep({ body: e.target.value })}
                        rows={12}
                        placeholder='{
  "key": "value"
}'
                        className={`flex-1 w-full text-xs font-mono p-3 rounded-xl border focus:outline-hidden resize-none transition ${
                          isDarkMode 
                            ? 'bg-[#0b0c16] border-zinc-800 text-zinc-200 focus:border-purple-500/50' 
                            : 'bg-white border-slate-300 text-slate-900 focus:border-violet-500 shadow-inner'
                        }`}
                      />
                    </div>
                  )}

                  {/* HEADERS TAB */}
                  {reqTab === 'headers' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Request Headers</span>
                        <button
                          onClick={() => {
                            const newHeader = { id: Date.now().toString(), enabled: true, key: '', value: '' };
                            updateActiveStep(s => ({ ...s, headers: [...(s.headers || []), newHeader] }));
                          }}
                          className="text-xs text-purple-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Header</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {(activeStep.headers || []).map((h, idx) => (
                          <div key={h.id || idx} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={h.enabled}
                              onChange={e => {
                                const hdrs = [...(activeStep.headers || [])];
                                hdrs[idx].enabled = e.target.checked;
                                updateActiveStep({ headers: hdrs });
                              }}
                              className="rounded border-zinc-700 text-purple-600 focus:ring-0 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={h.key}
                              placeholder="Header key (e.g. Authorization)"
                              onChange={e => {
                                const hdrs = [...(activeStep.headers || [])];
                                hdrs[idx].key = e.target.value;
                                updateActiveStep({ headers: hdrs });
                              }}
                              className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border font-mono ${
                                isDarkMode ? 'bg-[#0f101d] border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                            <input
                              type="text"
                              value={h.value}
                              placeholder="Header value (e.g. Bearer {{step1_token}})"
                              onChange={e => {
                                const hdrs = [...(activeStep.headers || [])];
                                hdrs[idx].value = e.target.value;
                                updateActiveStep({ headers: hdrs });
                              }}
                              className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border font-mono ${
                                isDarkMode ? 'bg-[#0f101d] border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                            <button
                              onClick={() => {
                                const hdrs = (activeStep.headers || []).filter((_, i) => i !== idx);
                                updateActiveStep({ headers: hdrs });
                              }}
                              className="p-1.5 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PARAMS TAB */}
                  {reqTab === 'params' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Query Parameters</span>
                        <button
                          onClick={() => {
                            const newParam = { id: Date.now().toString(), enabled: true, key: '', value: '' };
                            updateActiveStep(s => ({ ...s, params: [...(s.params || []), newParam] }));
                          }}
                          className="text-xs text-purple-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Query Param</span>
                        </button>
                      </div>

                      {(activeStep.params || []).length === 0 ? (
                        <p className="text-xs text-zinc-500 italic">No query parameters defined.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {activeStep.params.map((p, idx) => (
                            <div key={p.id || idx} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={p.enabled}
                                onChange={e => {
                                  const prms = [...(activeStep.params || [])];
                                  prms[idx].enabled = e.target.checked;
                                  updateActiveStep({ params: prms });
                                }}
                                className="rounded border-zinc-700 text-purple-600 focus:ring-0 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={p.key}
                                placeholder="Param name"
                                onChange={e => {
                                  const prms = [...(activeStep.params || [])];
                                  prms[idx].key = e.target.value;
                                  updateActiveStep({ params: prms });
                                }}
                                className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border font-mono ${
                                  isDarkMode ? 'bg-[#0f101d] border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              />
                              <input
                                type="text"
                                value={p.value}
                                placeholder="Param value"
                                onChange={e => {
                                  const prms = [...(activeStep.params || [])];
                                  prms[idx].value = e.target.value;
                                  updateActiveStep({ params: prms });
                                }}
                                className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border font-mono ${
                                  isDarkMode ? 'bg-[#0f101d] border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              />
                              <button
                                onClick={() => {
                                  const prms = (activeStep.params || []).filter((_, i) => i !== idx);
                                  updateActiveStep({ params: prms });
                                }}
                                className="p-1.5 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* VARIABLE EXTRACTION TAB */}
                  {reqTab === 'extraction' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Response Variable Extraction</h4>
                          <p className="text-[11px] text-zinc-400">
                            Define keys to automatically extract from this phase's JSON response and inject into downstream steps.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const newRule = { id: Date.now().toString(), targetVar: '', sourcePath: '', description: '' };
                            updateActiveStep(s => ({ ...s, extractionRules: [...(s.extractionRules || []), newRule] }));
                          }}
                          className="text-xs text-purple-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Extraction Rule</span>
                        </button>
                      </div>

                      {(activeStep.extractionRules || []).length === 0 ? (
                        <p className="text-xs text-zinc-500 italic p-3 rounded-xl border border-dashed border-zinc-800 text-center">
                          No extraction rules for this step. Click "+ Add Extraction Rule" to extract dynamic tokens or entity IDs.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {activeStep.extractionRules.map((r, idx) => (
                            <div key={r.id || idx} className={`p-3 rounded-xl border space-y-2 ${
                              isDarkMode ? 'bg-[#0f101d] border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
                            }`}>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[9.5px] font-bold uppercase text-zinc-400 mb-0.5">Target Variable Name</label>
                                  <input
                                    type="text"
                                    value={r.targetVar || ''}
                                    placeholder="e.g. step1_token or userId"
                                    onChange={e => {
                                      const rules = [...activeStep.extractionRules];
                                      rules[idx].targetVar = e.target.value;
                                      updateActiveStep({ extractionRules: rules });
                                    }}
                                    className={`w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border ${
                                      isDarkMode ? 'bg-[#151728] border-zinc-700 text-purple-300' : 'bg-slate-50 border-slate-300 text-purple-700'
                                    }`}
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9.5px] font-bold uppercase text-zinc-400 mb-0.5">JSON Path in Response</label>
                                  <input
                                    type="text"
                                    value={r.sourcePath || ''}
                                    placeholder="e.g. token or data.user.id"
                                    onChange={e => {
                                      const rules = [...activeStep.extractionRules];
                                      rules[idx].sourcePath = e.target.value;
                                      updateActiveStep({ extractionRules: rules });
                                    }}
                                    className={`w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border ${
                                      isDarkMode ? 'bg-[#151728] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                                    }`}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] pt-1">
                                <span className="text-zinc-500">
                                  Resolved Value:{' '}
                                  <strong className="font-mono text-emerald-400">
                                    {runtimeVars[r.targetVar] !== undefined ? String(runtimeVars[r.targetVar]) : '(not extracted yet)'}
                                  </strong>
                                </span>
                                <button
                                  onClick={() => {
                                    const rules = activeStep.extractionRules.filter((_, i) => i !== idx);
                                    updateActiveStep({ extractionRules: rules });
                                  }}
                                  className="text-zinc-500 hover:text-rose-400 text-xs transition cursor-pointer"
                                >
                                  Remove Rule
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </section>

              {/* RIGHT HALF: RESPONSE VISUALIZER */}
              <section className="flex-1 flex flex-col overflow-hidden">
                
                {/* Response Status Bar */}
                <div className={`p-3 border-b flex items-center justify-between ${
                  isDarkMode ? 'bg-[#121424] border-zinc-800/80' : 'bg-slate-100/70 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Response</span>
                    
                    {currentResult ? (
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                          currentResult.status_code >= 200 && currentResult.status_code < 300
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : currentResult.status_code >= 400 && currentResult.status_code < 500
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}>
                          {currentResult.status_code} {currentResult.status_text}
                        </span>

                        <span className="text-zinc-400 text-xs flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" />
                          <span>{currentResult.time_ms} ms</span>
                        </span>

                        <span className="text-zinc-400 text-xs flex items-center gap-1 font-mono">
                          <HardDrive className="h-3 w-3" />
                          <span>{currentResult.size_bytes} B</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-500 italic">No response generated yet</span>
                    )}
                  </div>

                  {currentResult && (
                    <button
                      onClick={() => {
                        const content = typeof currentResult.data === 'object'
                          ? JSON.stringify(currentResult.data, null, 2)
                          : String(currentResult.data);
                        navigator.clipboard.writeText(content);
                        setCopiedResponse(true);
                        setTimeout(() => setCopiedResponse(false), 1800);
                      }}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                        isDarkMode ? 'border-zinc-750 hover:bg-zinc-800 text-zinc-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {copiedResponse ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>

                {/* Response Sub-Tabs */}
                <div className={`flex items-center px-3 border-b text-xs space-x-4 ${
                  isDarkMode ? 'bg-[#101220] border-zinc-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  {[
                    { id: 'body', label: 'Response Body' },
                    { id: 'headers', label: `Headers (${currentResult ? Object.keys(currentResult.headers || {}).length : 0})` },
                    { id: 'extracted', label: 'Runtime Context' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setResTab(tab.id)}
                      className={`py-2 font-bold border-b-2 transition cursor-pointer ${
                        resTab === tab.id
                          ? 'border-purple-500 text-purple-400'
                          : 'border-transparent text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Response Content View */}
                <div className="flex-1 p-3.5 overflow-auto">
                  {!currentResult ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                      <Terminal className="h-8 w-8 text-zinc-600" />
                      <p className="text-xs text-zinc-500">
                        Click <span className="font-bold text-zinc-300">"Send"</span> or trigger <span className="font-bold text-purple-400">"Run Chained Pipeline"</span> to see response metrics.
                      </p>
                    </div>
                  ) : resTab === 'body' ? (
                    <pre className={`p-4 rounded-xl text-xs font-mono overflow-auto leading-relaxed border ${
                      isDarkMode 
                        ? 'bg-[#080911] border-zinc-850 text-emerald-300 shadow-inner' 
                        : 'bg-slate-900 text-emerald-300 border-slate-800 shadow-inner'
                    }`}>
                      {typeof currentResult.data === 'object'
                        ? JSON.stringify(currentResult.data, null, 2)
                        : String(currentResult.data)}
                    </pre>
                  ) : resTab === 'headers' ? (
                    <div className="space-y-1.5 font-mono text-xs">
                      {Object.entries(currentResult.headers || {}).map(([k, v]) => (
                        <div key={k} className="flex border-b border-zinc-800/40 py-1">
                          <span className="w-1/3 font-bold text-purple-400 truncate">{k}:</span>
                          <span className="w-2/3 text-zinc-300 truncate">{v}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Extracted Variables Tab */
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Dynamic Injected Context</h4>
                      {Object.entries(runtimeVars).length === 0 ? (
                        <p className="text-xs text-zinc-500">No variables extracted from executions yet.</p>
                      ) : (
                        Object.entries(runtimeVars).map(([k, v]) => (
                          <div key={k} className="p-3 rounded-xl border space-y-1 bg-purple-950/20 border-purple-800/30">
                            <span className="text-[10.5px] font-bold text-purple-400">{`{{${k}}}`}</span>
                            <p className="text-xs font-mono text-zinc-200 break-all">{String(v)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

              </section>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-zinc-500">
              <p>No step selected. Choose a step from the sidebar or click "+ Add Step".</p>
            </div>
          )}

        </main>
      </div>

      {/* PROJECT-SCOPED ENVIRONMENT MANAGEMENT MODAL */}
      {showEnvModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 transition ${
            isDarkMode ? 'bg-[#121422] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">
                    Environment & Variable Studio
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Project: <span className="font-bold text-zinc-200">{currentProject.name}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setShowEnvModal(false)} className="text-zinc-500 hover:text-zinc-300 font-bold p-1 cursor-pointer">
                ✕
              </button>
            </div>

            {/* Environment Tabs & "+ New Environment" Inline Creation */}
            <div className="space-y-3 border-b pb-3">
              <div className="flex flex-wrap items-center gap-2">
                {environments.map(env => (
                  <button
                    key={env.id}
                    onClick={() => setActiveEnvId(env.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      activeEnvId === env.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : isDarkMode
                          ? 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{env.name}</span>
                    {env.is_default && (
                      <span className="text-[9px] bg-white/20 px-1 rounded uppercase">default</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Add New Custom Environment Row */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  value={newEnvName}
                  onChange={e => setNewEnvName(e.target.value)}
                  placeholder="New Environment name (e.g. QA-02, Pre-Prod)..."
                  className={`text-xs px-3 py-1.5 rounded-lg border flex-1 ${
                    isDarkMode ? 'bg-[#0f101d] border-zinc-750 text-zinc-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateEnvironment();
                  }}
                />
                <button
                  onClick={handleCreateEnvironment}
                  disabled={!newEnvName.trim() || isCreatingEnv}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ New Environment</span>
                </button>
              </div>
            </div>

            {/* Key-Value Table for Active Environment */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Variables for "{activeEnv.name}"
                  </span>
                  <span className="text-[11px] text-zinc-400 ml-2">
                    ({(activeEnv.variables || []).length} Keys)
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const updated = environments.map(e => {
                        if (e.id === activeEnvId) {
                          return { ...e, variables: [...(e.variables || []), { key: '', value: '' }] };
                        }
                        return e;
                      });
                      setEnvironments(updated);
                    }}
                    className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Variable</span>
                  </button>

                  {!activeEnv.is_default && environments.length > 1 && (
                    <button
                      onClick={() => handleDeleteEnvironment(activeEnv.id)}
                      className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer ml-2"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete Environment</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Key-Value List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {(activeEnv.variables || []).length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-3 text-center border border-dashed border-zinc-800 rounded-xl">
                    No variables in this environment. Click "+ Add Variable" to define keys.
                  </p>
                ) : (
                  (activeEnv.variables || []).map((v, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={v.key}
                        placeholder="Variable key (e.g. baseUrl)"
                        onChange={e => {
                          const updated = environments.map(env => {
                            if (env.id === activeEnvId) {
                              const vars = [...(env.variables || [])];
                              vars[idx].key = e.target.value;
                              return { ...env, variables: vars };
                            }
                            return env;
                          });
                          setEnvironments(updated);
                        }}
                        className={`w-1/3 text-xs font-mono px-2.5 py-1.5 rounded-lg border ${
                          isDarkMode ? 'bg-[#0f101d] border-zinc-750 text-purple-300' : 'bg-slate-50 border-slate-300 text-purple-700'
                        }`}
                      />
                      <input
                        type="text"
                        value={v.value}
                        placeholder="Variable value (e.g. https://api.bankalhabib.com)"
                        onChange={e => {
                          const updated = environments.map(env => {
                            if (env.id === activeEnvId) {
                              const vars = [...(env.variables || [])];
                              vars[idx].value = e.target.value;
                              return { ...env, variables: vars };
                            }
                            return env;
                          });
                          setEnvironments(updated);
                        }}
                        className={`flex-1 text-xs font-mono px-2.5 py-1.5 rounded-lg border ${
                          isDarkMode ? 'bg-[#0f101d] border-zinc-750 text-zinc-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                      <button
                        onClick={() => {
                          const updated = environments.map(env => {
                            if (env.id === activeEnvId) {
                              return { ...env, variables: (env.variables || []).filter((_, i) => i !== idx) };
                            }
                            return env;
                          });
                          setEnvironments(updated);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                        title="Delete variable"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div>
                {envSaveStatus && envSaveStatus.envId === activeEnv.id && (
                  <span className={`text-xs font-bold ${
                    envSaveStatus.status === 'success' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {envSaveStatus.msg || 'Saving...'}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSaveEnvironment(activeEnv)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5 text-purple-400" />
                  <span>Save Variables</span>
                </button>
                <button
                  onClick={() => setShowEnvModal(false)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
