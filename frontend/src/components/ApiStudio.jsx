import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Copy,
  Check,
  X,
  Plus,
  Trash2,
  Settings2,
  Terminal,
  Code2,
  ChevronRight,
  ChevronDown,
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
  BookmarkCheck,
  BookOpen,
  ArrowDownToLine,
  Filter,
  Eye,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Lock,
  CheckCheck,
  PlusCircle
} from 'lucide-react';
import bahlLogo from '../assets/bahl-logo.png';
import SnippetDrawer from './SnippetDrawer';

const METHOD_COLORS = {
  GET: {
    bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    btn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    badge: 'text-emerald-500 font-bold'
  },
  POST: {
    bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    btn: 'bg-blue-600 hover:bg-blue-500 text-white',
    badge: 'text-blue-500 font-bold'
  },
  PUT: {
    bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    btn: 'bg-amber-600 hover:bg-amber-500 text-white',
    badge: 'text-amber-500 font-bold'
  },
  PATCH: {
    bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    btn: 'bg-purple-600 hover:bg-purple-500 text-white',
    badge: 'text-purple-500 font-bold'
  },
  DELETE: {
    bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    btn: 'bg-rose-600 hover:bg-rose-500 text-white',
    badge: 'text-rose-500 font-bold'
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

const BUILTIN_ENVIRONMENTS = [
  {
    id: 'local',
    name: 'Local Backend',
    isBuiltin: true,
    variables: {
      baseUrl: 'http://127.0.0.1:5000/api',
      adminEmail: 'admin@bankalhabib.com',
      adminPassword: 'Admin123!'
    }
  },
  {
    id: 'dev',
    name: 'Dev Environment',
    isBuiltin: true,
    variables: {
      baseUrl: 'https://dev-sdlc.bankalhabib.com/api',
      adminEmail: 'dev.admin@bankalhabib.com',
      adminPassword: 'DevAdmin2026!'
    }
  },
  {
    id: 'staging',
    name: 'Staging Cluster',
    isBuiltin: true,
    variables: {
      baseUrl: 'https://staging-sdlc.bankalhabib.com/api',
      adminEmail: 'qa.lead@bankalhabib.com',
      adminPassword: 'StagingLead2026!'
    }
  },
  {
    id: 'prod',
    name: 'Production Gateway',
    isBuiltin: true,
    variables: {
      baseUrl: 'https://sdlc.bankalhabib.com/api',
      adminEmail: 'secops@bankalhabib.com',
      adminPassword: 'ProdSecurity2026!'
    }
  }
];

const BUILTIN_NAMES = new Set([
  'Local Backend', 'Dev Environment', 'Staging Cluster', 'Production Gateway',
  'Local (Development)', 'Development (Sandbox)', 'Staging (UAT)', 'Staging (UAT Cluster)', 'Production (Live)'
]);

// Helper to extract nested value from JSON object by path
function extractJsonPath(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

// Helper to replace {{varName}} in string
function interpolateVariables(str, varMap) {
  if (typeof str !== 'string') return str;
  return str.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, key) => {
    return varMap[key] !== undefined ? String(varMap[key]) : match;
  });
}

export default function ApiStudio({ onBack, isDarkMode, authUser, activeProject, projects, onSelectProject }) {
  // Current active project binding
  const currentProject = activeProject || (projects && projects.length > 0 ? projects[0] : { id: 1, name: 'Core Banking Modernization' });
  const projectId = currentProject?.id || 1;

  // Environments State (Project-scoped)
  const [customEnvironments, setCustomEnvironments] = useState([]);
  const [activeEnvId, setActiveEnvId] = useState('local');
  const [isEnvDropdownOpen, setIsEnvDropdownOpen] = useState(false);
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [isLoadingEnvs, setIsLoadingEnvs] = useState(false);
  const [editingEnv, setEditingEnv] = useState(null);
  const [envSaveStatus, setEnvSaveStatus] = useState(null);
  const envDropdownRef = useRef(null);

  // Snippet Drawer State
  const [showSnippetDrawer, setShowSnippetDrawer] = useState(false);

  // Multi-Phase Dynamic Pipeline Steps State (Project-scoped)
  const [steps, setSteps] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(false);
  const [isSavingPipeline, setIsSavingPipeline] = useState(false);
  const [pipelineSaveStatus, setPipelineSaveStatus] = useState(null);

  // Runtime extracted variables from chained pipeline or single execution
  const [runtimeVars, setRuntimeVars] = useState({});

  // Active step editor state
  const [activeTab, setActiveTab] = useState('body'); // 'body' | 'headers' | 'params' | 'extraction'
  const [responseTab, setResponseTab] = useState('body'); // 'body' | 'headers' | 'extracted'

  // Per-step execution state map
  const [stepExecutions, setStepExecutions] = useState({});
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState({ current: 0, total: 0, status: 'idle' });

  // Saved Response comparison state
  const [viewingSavedResponse, setViewingSavedResponse] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (envDropdownRef.current && !envDropdownRef.current.contains(event.target)) {
        setIsEnvDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter custom environments so standard/dummy ones are never duplicated
  const filteredCustomEnvs = useMemo(() => {
    return customEnvironments.filter(e => !BUILTIN_NAMES.has(e.name) && !['local', 'dev', 'staging', 'prod'].includes(String(e.id)));
  }, [customEnvironments]);

  // Merged environments list
  const allEnvironments = useMemo(() => {
    return [...BUILTIN_ENVIRONMENTS, ...filteredCustomEnvs];
  }, [filteredCustomEnvs]);

  // Current active environment object
  const activeEnv = useMemo(() => {
    return allEnvironments.find(e => String(e.id) === String(activeEnvId)) || BUILTIN_ENVIRONMENTS[0];
  }, [allEnvironments, activeEnvId]);

  // Combined available variables: Environment vars + dynamically extracted runtime vars
  const mergedVariables = useMemo(() => {
    return {
      ...(activeEnv?.variables || {}),
      ...runtimeVars
    };
  }, [activeEnv, runtimeVars]);

  // Active step object
  const activeStep = steps[activeStepIndex] || steps[0] || null;
  const activeStepExec = activeStep ? (stepExecutions[activeStep.id] || {}) : {};

  // Fetch Custom Environments for Project
  const fetchEnvironments = useCallback(async () => {
    try {
      setIsLoadingEnvs(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://127.0.0.1:5000/api/projects/${projectId}/api-environments`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : (data.environments || []);
        const normalized = rawList.map(env => {
          let varsObj = {};
          if (Array.isArray(env.variables)) {
            env.variables.forEach(v => {
              if (v && v.key) varsObj[v.key] = v.value || '';
            });
          } else if (typeof env.variables === 'object' && env.variables !== null) {
            varsObj = env.variables;
          }
          return {
            ...env,
            variables: varsObj
          };
        });
        setCustomEnvironments(normalized);
      }
    } catch (err) {
      console.error('Failed to load custom environments:', err);
    } finally {
      setIsLoadingEnvs(false);
    }
  }, [projectId]);

  // Fetch Pipeline for Project
  const fetchPipeline = useCallback(async () => {
    try {
      setIsLoadingPipeline(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://127.0.0.1:5000/api/projects/${projectId}/api-pipeline`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.pipeline && Array.isArray(data.pipeline.steps) && data.pipeline.steps.length > 0) {
          setSteps(data.pipeline.steps);
        } else {
          // Default initial 2-step pipeline
          setSteps([
            {
              id: 'step_1',
              name: '1. Authenticate & Obtain Dynamic Token',
              method: 'POST',
              url: '{{baseUrl}}/auth/login',
              headers: [
                { id: 'h1', enabled: true, key: 'Content-Type', value: 'application/json' },
                { id: 'h2', enabled: true, key: 'Accept', value: 'application/json' }
              ],
              params: [],
              body: JSON.stringify({ email: '{{adminEmail}}', password: '{{adminPassword}}' }, null, 2),
              extractionRules: [
                { id: 'e1', variableName: 'step1_token', jsonPath: 'token', description: 'Dynamic JWT Bearer Token' }
              ]
            },
            {
              id: 'step_2',
              name: '2. Query Corporate User Directory',
              method: 'GET',
              url: '{{baseUrl}}/admin/users',
              headers: [
                { id: 'h1', enabled: true, key: 'Authorization', value: 'Bearer {{step1_token}}' },
                { id: 'h2', enabled: true, key: 'Accept', value: 'application/json' }
              ],
              params: [],
              body: '',
              extractionRules: []
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch api pipeline:', err);
    } finally {
      setIsLoadingPipeline(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchEnvironments();
    fetchPipeline();
    setRuntimeVars({});
    setStepExecutions({});
    setActiveStepIndex(0);
  }, [projectId, fetchEnvironments, fetchPipeline]);

  // Save Pipeline to Backend
  const handleSavePipeline = async (updatedSteps = steps) => {
    try {
      setIsSavingPipeline(true);
      setPipelineSaveStatus(null);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://127.0.0.1:5000/api/projects/${projectId}/api-pipeline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ steps: updatedSteps })
      });
      if (res.ok) {
        setPipelineSaveStatus({ type: 'success', message: 'Pipeline configuration saved!' });
        setTimeout(() => setPipelineSaveStatus(null), 3000);
      } else {
        setPipelineSaveStatus({ type: 'error', message: 'Failed to save pipeline configuration' });
      }
    } catch (err) {
      console.error('Error saving pipeline:', err);
      setPipelineSaveStatus({ type: 'error', message: 'Network error saving pipeline' });
    } finally {
      setIsSavingPipeline(false);
    }
  };

  // Reset Pipeline to default template
  const handleResetPipeline = async () => {
    if (!window.confirm('Reset this project\'s API pipeline to the default banking authentication & directory template?')) return;
    try {
      setIsLoadingPipeline(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://127.0.0.1:5000/api/projects/${projectId}/api-pipeline/reset`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setSteps(data.pipeline?.steps || []);
        setActiveStepIndex(0);
        setRuntimeVars({});
        setStepExecutions({});
        setPipelineSaveStatus({ type: 'success', message: 'Pipeline reset to default template!' });
        setTimeout(() => setPipelineSaveStatus(null), 3000);
      }
    } catch (err) {
      console.error('Failed to reset pipeline:', err);
    } finally {
      setIsLoadingPipeline(false);
    }
  };

  // Step Mutation Handlers
  const handleUpdateActiveStep = (updatedFields) => {
    setSteps(prev => prev.map((step, idx) => idx === activeStepIndex ? { ...step, ...updatedFields } : step));
  };

  const handleAddStep = () => {
    const newStep = createDefaultStep(steps.length + 1);
    const updated = [...steps, newStep];
    setSteps(updated);
    setActiveStepIndex(updated.length - 1);
    handleSavePipeline(updated);
  };

  const handleDeleteStep = (indexToDelete, e) => {
    if (e) e.stopPropagation();
    if (steps.length <= 1) {
      alert('Pipeline must have at least one step.');
      return;
    }
    const updated = steps.filter((_, idx) => idx !== indexToDelete);
    setSteps(updated);
    if (activeStepIndex >= updated.length) {
      setActiveStepIndex(Math.max(0, updated.length - 1));
    }
    handleSavePipeline(updated);
  };

  const handleMoveStep = (fromIndex, toIndex, e) => {
    if (e) e.stopPropagation();
    if (toIndex < 0 || toIndex >= steps.length) return;
    const updated = [...steps];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setSteps(updated);
    setActiveStepIndex(toIndex);
    handleSavePipeline(updated);
  };

  // Execute a single step with provided context variables
  const executeStep = async (step, contextVars) => {
    const startTime = performance.now();
    const stepId = step.id;

    // Set step as executing
    setStepExecutions(prev => ({
      ...prev,
      [stepId]: { ...(prev[stepId] || {}), isExecuting: true, isError: false }
    }));

    try {
      // 1. Interpolate URL
      let targetUrl = interpolateVariables(step.url, contextVars);

      // 2. Query Params
      if (Array.isArray(step.params) && step.params.length > 0) {
        const enabledParams = step.params.filter(p => p.enabled && p.key);
        if (enabledParams.length > 0) {
          const urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : `http://127.0.0.1:5000${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`);
          enabledParams.forEach(p => {
            urlObj.searchParams.set(interpolateVariables(p.key, contextVars), interpolateVariables(p.value, contextVars));
          });
          targetUrl = urlObj.toString();
        }
      }

      // 3. Interpolate Headers
      const requestHeaders = {};
      if (Array.isArray(step.headers)) {
        step.headers.filter(h => h.enabled && h.key).forEach(h => {
          requestHeaders[interpolateVariables(h.key, contextVars)] = interpolateVariables(h.value, contextVars);
        });
      }

      // 4. Interpolate Body
      let requestBody = null;
      if (['POST', 'PUT', 'PATCH'].includes(step.method) && step.body) {
        requestBody = interpolateVariables(step.body, contextVars);
      }

      // 5. Execute HTTP Request
      const fetchOptions = {
        method: step.method,
        headers: requestHeaders
      };
      if (requestBody && ['POST', 'PUT', 'PATCH'].includes(step.method)) {
        fetchOptions.body = requestBody;
      }

      const res = await fetch(targetUrl, fetchOptions);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      // Extract response headers
      const resHeaders = {};
      res.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });

      // Parse payload
      let responseData = null;
      let rawText = '';
      try {
        rawText = await res.text();
        responseData = JSON.parse(rawText);
      } catch {
        responseData = rawText;
      }

      const responseSize = rawText ? (new TextEncoder().encode(rawText).length / 1024).toFixed(2) : '0.00';

      // 6. Execute Variable Extractions
      const newlyExtracted = {};
      if (Array.isArray(step.extractionRules) && step.extractionRules.length > 0 && typeof responseData === 'object') {
        step.extractionRules.forEach(rule => {
          if (rule.variableName && rule.jsonPath) {
            const val = extractJsonPath(responseData, rule.jsonPath);
            if (val !== undefined) {
              newlyExtracted[rule.variableName] = typeof val === 'object' ? JSON.stringify(val) : val;
            }
          }
        });
      }

      const execResult = {
        isExecuting: false,
        response: responseData,
        responseStatus: res.status,
        responseStatusText: res.statusText,
        responseTime,
        responseSize: `${responseSize} KB`,
        responseHeaders: resHeaders,
        isError: !res.ok,
        extractedVariables: newlyExtracted,
        lastExecutedAt: new Date().toISOString()
      };

      setStepExecutions(prev => ({
        ...prev,
        [stepId]: execResult
      }));

      // Update global runtime vars with extracted items
      if (Object.keys(newlyExtracted).length > 0) {
        setRuntimeVars(prev => ({ ...prev, ...newlyExtracted }));
      }

      return {
        success: res.ok,
        extracted: newlyExtracted,
        result: execResult
      };
    } catch (err) {
      const endTime = performance.now();
      const errorResult = {
        isExecuting: false,
        response: { error: err.message || 'Network request failed' },
        responseStatus: 0,
        responseStatusText: 'Network Error',
        responseTime: Math.round(endTime - startTime),
        responseSize: '0.00 KB',
        responseHeaders: {},
        isError: true,
        extractedVariables: {},
        lastExecutedAt: new Date().toISOString()
      };

      setStepExecutions(prev => ({
        ...prev,
        [stepId]: errorResult
      }));

      return { success: false, extracted: {}, result: errorResult };
    }
  };

  // Run single active step
  const handleRunActiveStep = async () => {
    if (!activeStep) return;
    setViewingSavedResponse(false);
    await executeStep(activeStep, mergedVariables);
  };

  // Run full chained multi-step pipeline sequentially
  const handleRunChainedPipeline = async () => {
    if (steps.length === 0 || isPipelineRunning) return;
    setIsPipelineRunning(true);
    setViewingSavedResponse(false);
    setPipelineProgress({ current: 0, total: steps.length, status: 'running' });

    let currentContext = { ...(activeEnv?.variables || {}) };
    let accumulatedRuntime = {};

    for (let i = 0; i < steps.length; i++) {
      setPipelineProgress({ current: i + 1, total: steps.length, status: 'running' });
      setActiveStepIndex(i);

      const step = steps[i];
      const mergedForStep = { ...currentContext, ...accumulatedRuntime };

      const res = await executeStep(step, mergedForStep);

      // Merge newly extracted variables into subsequent step contexts
      if (res.extracted && Object.keys(res.extracted).length > 0) {
        accumulatedRuntime = { ...accumulatedRuntime, ...res.extracted };
        currentContext = { ...currentContext, ...res.extracted };
      }

      await new Promise(r => setTimeout(r, 400));
    }

    setPipelineProgress({ current: steps.length, total: steps.length, status: 'completed' });
    setIsPipelineRunning(false);
  };

  // Save Response for the active step
  const handleSaveResponse = async () => {
    if (!activeStep) return;
    const currentExec = stepExecutions[activeStep.id];
    if (!currentExec || !currentExec.response) {
      alert('Execute the step first to receive a live response to save.');
      return;
    }

    const savedData = {
      savedAt: new Date().toISOString(),
      statusCode: currentExec.responseStatus,
      statusText: currentExec.responseStatusText,
      responseTime: currentExec.responseTime,
      responseSize: currentExec.responseSize,
      responseHeaders: currentExec.responseHeaders,
      responseBody: currentExec.response
    };

    const updatedSteps = steps.map((s, idx) => {
      if (idx === activeStepIndex) {
        return { ...s, savedResponse: savedData };
      }
      return s;
    });

    setSteps(updatedSteps);
    await handleSavePipeline(updatedSteps);

    setToastMessage(`Response saved successfully for Phase #${activeStepIndex + 1}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check if live response differs from saved response
  const savedResponseComparison = useMemo(() => {
    if (!activeStep?.savedResponse) return null;
    const currentExec = stepExecutions[activeStep.id];
    if (!currentExec || !currentExec.response) {
      return { hasSaved: true, hasLive: false, isMatch: null, savedAt: activeStep.savedResponse.savedAt };
    }
    const liveStr = JSON.stringify(currentExec.response);
    const savedStr = JSON.stringify(activeStep.savedResponse.responseBody);
    return {
      hasSaved: true,
      hasLive: true,
      isMatch: liveStr === savedStr,
      savedAt: activeStep.savedResponse.savedAt
    };
  }, [activeStep, stepExecutions]);

  // Snippet Drawer Handlers (Smart Merge & Body Replacement)
  const handleApplySnippet = (snippet) => {
    if (!activeStep) return;
    const isHeadersScope = snippet.scope === 'headers' || snippet.target_scope === 'headers';

    if (isHeadersScope) {
      // Parse incoming headers
      let incomingHeaders = [];
      try {
        const parsed = typeof snippet.content === 'string' ? JSON.parse(snippet.content) : snippet.content;
        if (Array.isArray(parsed)) {
          incomingHeaders = parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
          incomingHeaders = Object.entries(parsed).map(([k, v]) => ({
            id: `h_${Date.now()}_${k}`,
            key: k,
            value: String(v),
            enabled: true
          }));
        }
      } catch {
        if (typeof snippet.content === 'string') {
          snippet.content.split('\n').forEach((line, idx) => {
            const [k, ...v] = line.split(':');
            if (k && v.length) {
              incomingHeaders.push({
                id: `h_${Date.now()}_${idx}`,
                key: k.trim(),
                value: v.join(':').trim(),
                enabled: true
              });
            }
          });
        }
      }

      // Merge headers without erasing existing ones
      const existingHeaders = [...(activeStep.headers || [])];
      incomingHeaders.forEach(inH => {
        const existingIdx = existingHeaders.findIndex(h => h.key.toLowerCase() === inH.key.toLowerCase());
        if (existingIdx >= 0) {
          existingHeaders[existingIdx] = { ...existingHeaders[existingIdx], value: inH.value, enabled: true };
        } else {
          existingHeaders.push({
            id: inH.id || `h_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            key: inH.key,
            value: inH.value,
            enabled: inH.enabled !== false
          });
        }
      });

      handleUpdateActiveStep({ headers: existingHeaders });
      setActiveTab('headers');
    } else {
      // Body scope replacement/insertion
      handleUpdateActiveStep({
        body: typeof snippet.content === 'string' ? snippet.content : JSON.stringify(snippet.content, null, 2),
        ...(snippet.method ? { method: snippet.method } : {})
      });
      setActiveTab('body');
    }

    setShowSnippetDrawer(false);
    setToastMessage(`Snippet successfully applied to Phase #${activeStepIndex + 1}: ${activeStep.name}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleInsertVariable = (varName) => {
    const varTag = `{{${varName}}}`;
    if (activeTab === 'body') {
      const currentBody = activeStep.body || '';
      handleUpdateActiveStep({ body: currentBody + (currentBody ? '\n' : '') + varTag });
    } else {
      const currentUrl = activeStep.url || '';
      handleUpdateActiveStep({ url: currentUrl + varTag });
    }
  };

  // Custom Environment Management Modal Handlers
  const handleOpenNewEnvModal = () => {
    setIsEnvDropdownOpen(false);
    setEditingEnv({
      id: '',
      name: '',
      isBuiltin: false,
      variables: {
        baseUrl: 'http://127.0.0.1:5000/api',
        apiKey: '',
        bearerToken: ''
      }
    });
    setShowEnvModal(true);
  };

  const handleOpenEditEnvModal = (env, e) => {
    if (e) e.stopPropagation();
    if (env.isBuiltin) return;
    setIsEnvDropdownOpen(false);
    setEditingEnv(JSON.parse(JSON.stringify(env)));
    setShowEnvModal(true);
  };

  const handleSaveCustomEnv = async () => {
    if (!editingEnv || !editingEnv.name.trim()) {
      alert('Please enter an environment name.');
      return;
    }

    try {
      setEnvSaveStatus({ type: 'loading', message: 'Saving environment...' });
      const token = localStorage.getItem('authToken');
      const isNew = !editingEnv.id;

      const url = `http://127.0.0.1:5000/api/projects/${projectId}/api-environments${isNew ? '' : `/${editingEnv.id}`}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: editingEnv.name,
          variables: editingEnv.variables || {}
        })
      });

      if (res.ok) {
        const data = await res.json();
        await fetchEnvironments();
        if (data && data.id) {
          setActiveEnvId(String(data.id));
        }
        setShowEnvModal(false);
        setEditingEnv(null);
        setEnvSaveStatus(null);
      } else {
        setEnvSaveStatus({ type: 'error', message: 'Failed to save environment.' });
      }
    } catch (err) {
      console.error('Error saving environment:', err);
      setEnvSaveStatus({ type: 'error', message: 'Network error.' });
    }
  };

  const handleDeleteCustomEnv = async (envId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this custom environment?')) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://127.0.0.1:5000/api/projects/${projectId}/api-environments/${envId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        if (activeEnvId === envId || String(activeEnvId) === String(envId)) {
          setActiveEnvId('local');
        }
        await fetchEnvironments();
      }
    } catch (err) {
      console.error('Error deleting environment:', err);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* ========================================================================= */}
      {/* 1. CLEAN, STREAMLINED SINGLE-LINE TOOLBAR                                 */}
      {/* ========================================================================= */}
      <header className={`h-14 px-4 border-b flex items-center justify-between gap-3 sticky top-0 z-30 transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800/80 backdrop-blur-md' : 'bg-white/95 border-slate-200/90 backdrop-blur-md shadow-sm'
      }`}>
        
        {/* Left: Navigation & Studio Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
            title="Return to Kanban Board"
          >
            <ArrowLeft size={16} />
            {/* <span>Back to Board</span> */}
          </button>

          {/* <div className="h-4 w-px bg-slate-700/50" />

          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight">API Execution Studio</h1>
          </div> */}
        </div>

        {/* Center: Clean Project & Custom Environment Selectors */}
        <div className="flex items-center gap-2.5 max-w-xl flex-1 justify-center">
          {/* Project Selector */}
          {projects && projects.length > 0 && onSelectProject && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs ${
              isDarkMode ? 'bg-slate-800/70 border-slate-700/80 text-slate-300' : 'bg-slate-100/90 border-slate-200 text-slate-700'
            }`}>
              <FolderGit2 size={14} className="text-purple-400 shrink-0" />
              <select
                id="api-project-select"
                value={projectId}
                onChange={(e) => onSelectProject(Number(e.target.value))}
                className="bg-transparent border-none focus:outline-none text-xs font-semibold cursor-pointer max-w-[200px] truncate"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className={isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Popover Environment Selector (High Visibility & Clean Theme) */}
          <div className="relative" ref={envDropdownRef}>
            <button
              id="api-environment-btn"
              onClick={() => setIsEnvDropdownOpen(!isEnvDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                isDarkMode 
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600' 
                  : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <Globe size={14} className="text-emerald-400 shrink-0" />
              <span className="max-w-[150px] truncate">{activeEnv?.name || 'Local Backend'}</span>
              <ChevronDown size={13} className={`text-slate-400 shrink-0 transition-transform ${isEnvDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Floating Dropdown Popover */}
            {isEnvDropdownOpen && (
              <div className={`absolute left-0 mt-1.5 w-64 rounded-xl border shadow-2xl p-1.5 z-50 animate-fade-in ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                {/* Standard Environments Group */}
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Standard Environments
                </div>
                <div className="flex flex-col gap-0.5 mb-1">
                  {BUILTIN_ENVIRONMENTS.map(env => {
                    const isSelected = String(activeEnvId) === String(env.id);
                    return (
                      <button
                        key={env.id}
                        onClick={() => {
                          setActiveEnvId(env.id);
                          setIsEnvDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isSelected
                            ? isDarkMode ? 'bg-purple-950/50 text-purple-300 font-bold' : 'bg-purple-50 text-purple-700 font-bold'
                            : isDarkMode ? 'hover:bg-slate-800/80 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{env.name}</span>
                        {isSelected && <Check size={13} className="text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Environments Group */}
                {filteredCustomEnvs.length > 0 && (
                  <>
                    <div className="h-px bg-slate-800/80 my-1" />
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Custom Environments</span>
                      <span className="text-[9px] font-mono">{filteredCustomEnvs.length}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 mb-1">
                      {filteredCustomEnvs.map(env => {
                        const isSelected = String(activeEnvId) === String(env.id);
                        return (
                          <div
                            key={env.id}
                            onClick={() => {
                              setActiveEnvId(env.id);
                              setIsEnvDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer group ${
                              isSelected
                                ? isDarkMode ? 'bg-purple-950/50 text-purple-300 font-bold' : 'bg-purple-50 text-purple-700 font-bold'
                                : isDarkMode ? 'hover:bg-slate-800/80 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span className="truncate">{env.name}</span>
                            <div className="flex items-center gap-1">
                              {isSelected && <Check size={13} className="text-emerald-400 shrink-0" />}
                              <button
                                onClick={(e) => handleOpenEditEnvModal(env, e)}
                                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
                                title="Edit environment"
                              >
                                <Edit2 size={11} />
                              </button>
                              <button
                                onClick={(e) => handleDeleteCustomEnv(env.id, e)}
                                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-all"
                                title="Delete environment"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="h-px bg-slate-800/80 my-1" />

                {/* Footer Action: + Create Custom Environment */}
                <button
                  onClick={handleOpenNewEnvModal}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    isDarkMode 
                      ? 'text-purple-400 hover:bg-purple-950/40 hover:text-purple-300' 
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <PlusCircle size={14} className="text-purple-400 shrink-0" />
                  <span>Create Custom Environment</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions Toolbar */}
        <div className="flex items-center gap-2">
          {/* Snippets Drawer Toggle Button */}
          <button
            onClick={() => setShowSnippetDrawer(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isDarkMode 
                ? 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/60 hover:text-purple-100' 
                : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
            }`}
            title="Open Banking Payloads & Code Snippets Drawer"
          >
            <BookOpen size={14} className="text-purple-400" />
            <span>Snippets</span>
          </button>

          {/* Reset Pipeline */}
          <button
            onClick={handleResetPipeline}
            disabled={isLoadingPipeline || isPipelineRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Reset to default pipeline template"
          >
            <RotateCcw size={14} className={isLoadingPipeline ? 'animate-spin' : ''} />
            <span>Reset</span>
          </button>

          {/* Save Pipeline */}
          <button
            onClick={() => handleSavePipeline()}
            disabled={isSavingPipeline || isPipelineRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800' 
                : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
            }`}
            title="Save Pipeline configuration"
          >
            <Save size={14} className={isSavingPipeline ? 'animate-spin' : 'text-purple-400'} />
            <span>Save Pipeline</span>
          </button>

          {/* Run Chained Pipeline Button */}
          <button
            onClick={handleRunChainedPipeline}
            disabled={isPipelineRunning || steps.length === 0}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
              isPipelineRunning
                ? 'bg-purple-800 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/25'
            }`}
          >
            {isPipelineRunning ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Running ({pipelineProgress.current}/{pipelineProgress.total})...</span>
              </>
            ) : (
              <>
                <Play size={14} className="fill-white" />
                <span>Run Chained Pipeline</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Unified Toast Notifications */}
      {(toastMessage || pipelineSaveStatus) && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
          {toastMessage && (
            <div className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-xl flex items-center gap-2 animate-bounce">
              <CheckCircle2 size={16} />
              <span>{toastMessage}</span>
            </div>
          )}
          {pipelineSaveStatus && (
            <div className={`px-4 py-2.5 rounded-xl text-white font-semibold text-xs shadow-xl flex items-center gap-2 ${
              pipelineSaveStatus.type === 'success' ? 'bg-purple-600' : 'bg-rose-600'
            }`}>
              {pipelineSaveStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{pipelineSaveStatus.message}</span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN STUDIO 3-COLUMN WORKSPACE                                         */}
      {/* ========================================================================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: Pipeline Steps List (3 cols)  */}
        {/* ========================================== */}
        <div className={`lg:col-span-3 border-r flex flex-col overflow-y-auto ${
          isDarkMode ? 'bg-slate-900/30 border-slate-800/80' : 'bg-slate-50/50 border-slate-200'
        }`}>
          {/* Section Header */}
          <div className={`p-3 border-b flex items-center justify-between sticky top-0 z-10 ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white/95 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Pipeline Phases</span>
              <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
              }`}>
                {steps.length} {steps.length === 1 ? 'Step' : 'Steps'}
              </span>
            </div>

            <button
              onClick={handleAddStep}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border transition-all ${
                isDarkMode 
                  ? 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/60' 
                  : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <Plus size={12} />
              <span>Add Step</span>
            </button>
          </div>

          {/* Steps List */}
          <div className="p-3 flex flex-col gap-2 flex-1">
            {steps.map((step, idx) => {
              const isSelected = idx === activeStepIndex;
              const stepExec = stepExecutions[step.id] || {};
              const methodStyle = METHOD_COLORS[step.method] || METHOD_COLORS.GET;
              const hasExtractions = Array.isArray(step.extractionRules) && step.extractionRules.length > 0;
              const hasSaved = Boolean(step.savedResponse);

              return (
                <div key={step.id} className="relative">
                  {/* Step Card */}
                  <div
                    id={`pipeline-step-${idx + 1}`}
                    onClick={() => {
                      setActiveStepIndex(idx);
                      setViewingSavedResponse(false);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-purple-950/20 border-purple-500/50 shadow-sm'
                          : 'bg-purple-50/80 border-purple-300 shadow-sm'
                        : isDarkMode
                          ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border uppercase ${methodStyle.bg}`}>
                          {step.method}
                        </span>
                        <span className="text-xs font-bold truncate">
                          {step.name}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div className="flex items-center gap-1 shrink-0">
                        {stepExec.isExecuting ? (
                          <RefreshCw size={13} className="animate-spin text-purple-400" />
                        ) : stepExec.responseStatus !== undefined ? (
                          stepExec.isError ? (
                            <XCircle size={14} className="text-rose-400" />
                          ) : (
                            <CheckCircle2 size={14} className="text-emerald-400" />
                          )
                        ) : hasSaved ? (
                          <BookmarkCheck size={14} className="text-purple-400" title="Has Saved Response" />
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">READY</span>
                        )}
                      </div>
                    </div>

                    {/* Step URL preview */}
                    <div className="text-[11px] font-mono text-slate-400 truncate mb-1.5">
                      {step.url}
                    </div>

                    {/* Meta info & Action tools */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/30">
                      <div className="flex items-center gap-2">
                        {hasExtractions && (
                          <span className="flex items-center gap-1 text-purple-400 font-semibold">
                            <Zap size={10} />
                            <span>Extracts: {step.extractionRules.length}</span>
                          </span>
                        )}
                        {hasSaved && (
                          <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                            <BookmarkCheck size={10} />
                            <span>Saved Response</span>
                          </span>
                        )}
                      </div>

                      {/* Reorder & Delete controls */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleMoveStep(idx, idx - 1, e)}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-slate-700/50 disabled:opacity-30"
                          title="Move step up"
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          onClick={(e) => handleMoveStep(idx, idx + 1, e)}
                          disabled={idx === steps.length - 1}
                          className="p-1 rounded hover:bg-slate-700/50 disabled:opacity-30"
                          title="Move step down"
                        >
                          <ArrowDown size={11} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteStep(idx, e)}
                          className="p-1 rounded hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
                          title="Delete step"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Visual connector line between steps */}
                  {idx < steps.length - 1 && (
                    <div className="flex items-center justify-center py-0.5">
                      <div className="flex items-center gap-1 text-[9px] font-mono text-purple-400/70">
                        <ChevronRight size={9} className="rotate-90" />
                        <span>INJECTS CONTEXT</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Step Bottom Button */}
            <button
              onClick={handleAddStep}
              className={`w-full py-2 rounded-xl border border-dashed flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                isDarkMode
                  ? 'border-slate-800 hover:border-purple-600/60 text-slate-400 hover:text-purple-300 hover:bg-purple-950/20'
                  : 'border-slate-300 hover:border-purple-400 text-slate-600 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Plus size={13} />
              <span>Add Phase / Step</span>
            </button>
          </div>

          {/* Active Runtime Extracted Variables Drawer */}
          <div className={`p-3 border-t mt-auto ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-100/80 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Database size={12} className="text-purple-400" />
                <span>Runtime Context</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {Object.keys(runtimeVars).length} extracted
              </span>
            </div>

            {Object.keys(runtimeVars).length === 0 ? (
              <div className="text-[11px] text-slate-500 italic">
                No variables extracted yet. Execute steps to populate dynamic token and IDs.
              </div>
            ) : (
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {Object.entries(runtimeVars).map(([k, v]) => (
                  <div key={k} className={`p-1.5 rounded text-[10px] font-mono flex items-center justify-between ${
                    isDarkMode ? 'bg-slate-950/80 border border-slate-800' : 'bg-white border border-slate-200'
                  }`}>
                    <span className="text-purple-400 font-bold truncate">{'{{' + k + '}}'}</span>
                    <span className="text-slate-300 truncate max-w-[120px]" title={String(v)}>
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* CENTER COLUMN: Request Editor & Config (5 cols)     */}
        {/* ==================================================== */}
        {activeStep ? (
          <div className="lg:col-span-5 flex flex-col border-r border-slate-800/80 overflow-y-auto">
            {/* Step Header Bar */}
            <div className={`p-3 border-b flex items-center justify-between gap-2 ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs font-bold text-purple-400 shrink-0">
                  PHASE #{activeStepIndex + 1}:
                </span>
                <input
                  type="text"
                  value={activeStep.name}
                  onChange={(e) => handleUpdateActiveStep({ name: e.target.value })}
                  className={`text-xs font-bold px-2 py-1 rounded border flex-1 ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-purple-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-purple-500'
                  } focus:outline-none`}
                />
              </div>

              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                ID: {activeStep.id}
              </span>
            </div>

            {/* URL Input Bar */}
            <div className="p-3 border-b border-slate-800/80 flex items-center gap-2">
              <select
                value={activeStep.method}
                onChange={(e) => handleUpdateActiveStep({ method: e.target.value })}
                className={`text-xs font-bold px-2.5 py-2 rounded-lg border focus:outline-none ${METHOD_COLORS[activeStep.method]?.bg}`}
              >
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                  <option key={m} value={m} className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    {m}
                  </option>
                ))}
              </select>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={activeStep.url}
                  onChange={(e) => handleUpdateActiveStep({ url: e.target.value })}
                  placeholder="{{baseUrl}}/api/endpoint"
                  className={`w-full text-xs font-mono px-3 py-2 rounded-lg border focus:outline-none ${
                    isDarkMode 
                      ? 'bg-slate-900/90 border-slate-700 text-slate-100 focus:border-purple-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-purple-500'
                  }`}
                />
              </div>

              {/* Single Step Send Button */}
              <button
                onClick={handleRunActiveStep}
                disabled={activeStepExec.isExecuting || isPipelineRunning}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-sm ${
                  activeStepExec.isExecuting
                    ? 'bg-purple-800 opacity-80'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 active:scale-95'
                }`}
              >
                {activeStepExec.isExecuting ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Play size={13} className="fill-white" />
                )}
                <span>Send</span>
              </button>
            </div>

            {/* Config Tabs: Body | Headers | Params | Variable Extraction */}
            <div className={`flex items-center gap-1 px-3 border-b text-xs font-semibold ${
              isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-100/50'
            }`}>
              {[
                { id: 'body', label: 'Body' },
                { id: 'headers', label: `Headers (${activeStep.headers?.length || 0})` },
                { id: 'params', label: `Params (${activeStep.params?.length || 0})` },
                { id: 'extraction', label: `Variable Extraction (${activeStep.extractionRules?.length || 0})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2.5 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="p-3 flex-1 overflow-y-auto">
              {/* TAB 1: BODY */}
              {activeTab === 'body' && (
                <div className="flex flex-col h-full gap-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>JSON (application/json) with interpolation support:</span>
                    <button
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(activeStep.body);
                          handleUpdateActiveStep({ body: JSON.stringify(parsed, null, 2) });
                        } catch {}
                      }}
                      className="text-purple-400 hover:underline text-[11px] font-semibold"
                    >
                      Prettify JSON
                    </button>
                  </div>
                  <textarea
                    value={activeStep.body || ''}
                    onChange={(e) => handleUpdateActiveStep({ body: e.target.value })}
                    placeholder={'{\n  "key": "value",\n  "token": "{{step1_token}}"\n}'}
                    rows={14}
                    className={`w-full flex-1 p-3 rounded-xl font-mono text-xs border resize-none focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-900/90 border-slate-800 text-slate-200 focus:border-purple-500' 
                        : 'bg-white border-slate-300 text-slate-900 focus:border-purple-500'
                    }`}
                  />
                </div>
              )}

              {/* TAB 2: HEADERS */}
              {activeTab === 'headers' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-400">HTTP Headers</span>
                    <button
                      onClick={() => {
                        const newHeaders = [...(activeStep.headers || []), { id: Date.now().toString(), enabled: true, key: '', value: '' }];
                        handleUpdateActiveStep({ headers: newHeaders });
                      }}
                      className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      <Plus size={12} />
                      <span>Add Header</span>
                    </button>
                  </div>

                  {(activeStep.headers || []).map((h, hIdx) => (
                    <div key={h.id || hIdx} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={h.enabled}
                        onChange={(e) => {
                          const updated = [...activeStep.headers];
                          updated[hIdx].enabled = e.target.checked;
                          handleUpdateActiveStep({ headers: updated });
                        }}
                        className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                      />
                      <input
                        type="text"
                        placeholder="Header Key (e.g. Authorization)"
                        value={h.key}
                        onChange={(e) => {
                          const updated = [...activeStep.headers];
                          updated[hIdx].key = e.target.value;
                          handleUpdateActiveStep({ headers: updated });
                        }}
                        className={`flex-1 text-xs font-mono px-2.5 py-1.5 rounded border focus:outline-none ${
                          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Header Value (e.g. Bearer {{step1_token}})"
                        value={h.value}
                        onChange={(e) => {
                          const updated = [...activeStep.headers];
                          updated[hIdx].value = e.target.value;
                          handleUpdateActiveStep({ headers: updated });
                        }}
                        className={`flex-1 text-xs font-mono px-2.5 py-1.5 rounded border focus:outline-none ${
                          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                      <button
                        onClick={() => {
                          const updated = activeStep.headers.filter((_, idx) => idx !== hIdx);
                          handleUpdateActiveStep({ headers: updated });
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: PARAMS */}
              {activeTab === 'params' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-400">Query Parameters</span>
                    <button
                      onClick={() => {
                        const newParams = [...(activeStep.params || []), { id: Date.now().toString(), enabled: true, key: '', value: '' }];
                        handleUpdateActiveStep({ params: newParams });
                      }}
                      className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      <Plus size={12} />
                      <span>Add Parameter</span>
                    </button>
                  </div>

                  {(!activeStep.params || activeStep.params.length === 0) ? (
                    <div className="text-xs text-slate-500 italic py-4 text-center">No query parameters defined.</div>
                  ) : (
                    activeStep.params.map((p, pIdx) => (
                      <div key={p.id || pIdx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={p.enabled}
                          onChange={(e) => {
                            const updated = [...activeStep.params];
                            updated[pIdx].enabled = e.target.checked;
                            handleUpdateActiveStep({ params: updated });
                          }}
                          className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          placeholder="Param Key"
                          value={p.key}
                          onChange={(e) => {
                            const updated = [...activeStep.params];
                            updated[pIdx].key = e.target.value;
                            handleUpdateActiveStep({ params: updated });
                          }}
                          className={`flex-1 text-xs font-mono px-2.5 py-1.5 rounded border focus:outline-none ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="Param Value"
                          value={p.value}
                          onChange={(e) => {
                            const updated = [...activeStep.params];
                            updated[pIdx].value = e.target.value;
                            handleUpdateActiveStep({ params: updated });
                          }}
                          className={`flex-1 text-xs font-mono px-2.5 py-1.5 rounded border focus:outline-none ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                        <button
                          onClick={() => {
                            const updated = activeStep.params.filter((_, idx) => idx !== pIdx);
                            handleUpdateActiveStep({ params: updated });
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: VARIABLE EXTRACTION */}
              {activeTab === 'extraction' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-200">Response Variable Extractions</h3>
                      <p className="text-[11px] text-slate-400">
                        Extract fields from this step's response to dynamically inject into subsequent steps.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const newRules = [
                          ...(activeStep.extractionRules || []),
                          { id: Date.now().toString(), variableName: '', jsonPath: '', description: '' }
                        ];
                        handleUpdateActiveStep({ extractionRules: newRules });
                      }}
                      className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      <Plus size={12} />
                      <span>Add Extraction Rule</span>
                    </button>
                  </div>

                  {(!activeStep.extractionRules || activeStep.extractionRules.length === 0) ? (
                    <div className="p-6 rounded-xl border border-dashed text-center text-slate-500 text-xs">
                      No variable extractions defined for this step. Click "+ Add Extraction Rule" to capture dynamic tokens, IDs, or records.
                    </div>
                  ) : (
                    activeStep.extractionRules.map((rule, rIdx) => (
                      <div key={rule.id || rIdx} className={`p-3 rounded-xl border flex flex-col gap-2 ${
                        isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                              Variable Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. step1_token"
                              value={rule.variableName}
                              onChange={(e) => {
                                const updated = [...activeStep.extractionRules];
                                updated[rIdx].variableName = e.target.value;
                                handleUpdateActiveStep({ extractionRules: updated });
                              }}
                              className={`w-full text-xs font-mono px-2.5 py-1.5 rounded border focus:outline-none ${
                                isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>

                          <div className="flex-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                              JSON Path / Key
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. token or data.user.id"
                              value={rule.jsonPath}
                              onChange={(e) => {
                                const updated = [...activeStep.extractionRules];
                                updated[rIdx].jsonPath = e.target.value;
                                handleUpdateActiveStep({ extractionRules: updated });
                              }}
                              className={`w-full text-xs font-mono px-2.5 py-1.5 rounded border focus:outline-none ${
                                isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>

                          <button
                            onClick={() => {
                              const updated = activeStep.extractionRules.filter((_, idx) => idx !== rIdx);
                              handleUpdateActiveStep({ extractionRules: updated });
                            }}
                            className="p-1.5 mt-4 rounded text-slate-500 hover:text-rose-400"
                            title="Delete rule"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-5 flex items-center justify-center p-8 text-slate-500 text-xs">
            Select or create a step to configure
          </div>
        )}

        {/* ==================================================== */}
        {/* RIGHT COLUMN: Response, Metrics & Saved (4 cols)    */}
        {/* ==================================================== */}
        <div className={`lg:col-span-4 flex flex-col overflow-y-auto ${
          isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-white text-slate-800'
        }`}>
          {/* Header Bar */}
          <div className={`p-3 border-b flex items-center justify-between gap-2 sticky top-0 z-10 ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">Response</span>
              {activeStepExec.responseStatus !== undefined && (
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                  activeStepExec.isError
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {activeStepExec.responseStatus} {activeStepExec.responseStatusText}
                </span>
              )}
            </div>

            {/* Action Tools: Save Response & Copy */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSaveResponse}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  activeStepExec.response
                    ? isDarkMode 
                      ? 'bg-purple-950/60 border-purple-700/80 text-purple-300 hover:bg-purple-900/80 hover:text-white shadow-sm' 
                      : 'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200'
                    : 'opacity-50 cursor-not-allowed border-slate-800 text-slate-500'
                }`}
                title="Save current response as a persistent baseline for this step"
              >
                <Save size={13} className={activeStepExec.response ? 'text-purple-400' : ''} />
                <span>Save Response</span>
              </button>

              {activeStepExec.response && (
                <button
                  onClick={() => {
                    const text = typeof activeStepExec.response === 'object' 
                      ? JSON.stringify(activeStepExec.response, null, 2) 
                      : String(activeStepExec.response);
                    navigator.clipboard.writeText(text);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  title="Copy response body"
                >
                  <Copy size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Metrics bar */}
          {activeStepExec.responseStatus !== undefined && (
            <div className={`px-3 py-2 border-b flex items-center justify-between text-[11px] font-mono ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-100/60 border-slate-200 text-slate-600'
            }`}>
              <span className="flex items-center gap-1">
                <Clock size={11} className="text-purple-400" />
                <span>{activeStepExec.responseTime} ms</span>
              </span>
              <span className="flex items-center gap-1">
                <HardDrive size={11} className="text-purple-400" />
                <span>{activeStepExec.responseSize}</span>
              </span>
            </div>
          )}

          {/* Saved Response Comparison Banner */}
          {savedResponseComparison?.hasSaved && (
            <div className={`p-2.5 mx-3 mt-3 rounded-xl border flex items-center justify-between text-xs ${
              savedResponseComparison.isMatch === true
                ? isDarkMode ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : savedResponseComparison.isMatch === false
                  ? isDarkMode ? 'bg-amber-950/30 border-amber-800/60 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-800'
                  : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}>
              <div className="flex items-center gap-2">
                <BookmarkCheck size={14} className="text-purple-400 shrink-0" />
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>Saved Response</span>
                    {savedResponseComparison.isMatch === true && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                        Matches Live
                      </span>
                    )}
                    {savedResponseComparison.isMatch === false && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono">
                        Live Differs
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] opacity-75">
                    Saved on {new Date(savedResponseComparison.savedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setViewingSavedResponse(!viewingSavedResponse)}
                className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                  viewingSavedResponse 
                    ? 'bg-purple-600 text-white border-purple-500' 
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {viewingSavedResponse ? 'View Live' : 'View Saved'}
              </button>
            </div>
          )}

          {/* Response Tabs */}
          <div className={`flex items-center gap-1 px-3 border-b text-xs font-semibold mt-2 ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            {[
              { id: 'body', label: 'Response Body' },
              { id: 'headers', label: `Headers (${Object.keys(activeStepExec.responseHeaders || {}).length})` },
              { id: 'extracted', label: `Extracted (${Object.keys(activeStepExec.extractedVariables || {}).length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setResponseTab(tab.id)}
                className={`px-3 py-2 border-b-2 transition-all ${
                  responseTab === tab.id
                    ? 'border-purple-500 text-purple-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Response Payload Display */}
          <div className="p-3 flex-1 overflow-y-auto">
            {!activeStepExec.response && !activeStep?.savedResponse ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Terminal size={32} className="mb-2 opacity-30" />
                <p className="text-xs font-semibold">No response generated yet</p>
                <p className="text-[11px] text-slate-600 mt-1 max-w-xs">
                  Click "Send" or trigger "Run Chained Pipeline" to execute and inspect response payload.
                </p>
              </div>
            ) : responseTab === 'body' ? (
              /* TAB: Response Body (Live or Saved View) */
              <div className="relative">
                {viewingSavedResponse && activeStep?.savedResponse ? (
                  <div>
                    <div className="mb-2 text-[11px] font-mono text-purple-400 bg-purple-950/30 p-2 rounded border border-purple-800/40">
                      Viewing Saved Response Baseline:
                    </div>
                    <pre className={`p-3 rounded-xl font-mono text-xs overflow-x-auto border ${
                      isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      {JSON.stringify(activeStep.savedResponse.responseBody, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <pre className={`p-3 rounded-xl font-mono text-xs overflow-x-auto border ${
                    isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    {typeof activeStepExec.response === 'object'
                      ? JSON.stringify(activeStepExec.response, null, 2)
                      : String(activeStepExec.response || (activeStep?.savedResponse ? JSON.stringify(activeStep.savedResponse.responseBody, null, 2) : ''))}
                  </pre>
                )}
              </div>
            ) : responseTab === 'headers' ? (
              /* TAB: Response Headers */
              <div className="flex flex-col gap-1.5">
                {Object.entries(activeStepExec.responseHeaders || {}).map(([hk, hv]) => (
                  <div key={hk} className={`p-2 rounded text-xs font-mono border ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-purple-400 font-bold">{hk}: </span>
                    <span className="text-slate-300 break-all">{hv}</span>
                  </div>
                ))}
              </div>
            ) : (
              /* TAB: Extracted Variables */
              <div className="flex flex-col gap-2">
                {Object.keys(activeStepExec.extractedVariables || {}).length === 0 ? (
                  <div className="text-xs text-slate-500 italic text-center py-6">
                    No variables extracted in this step execution.
                  </div>
                ) : (
                  Object.entries(activeStepExec.extractedVariables || {}).map(([vk, vv]) => (
                    <div key={vk} className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      isDarkMode ? 'bg-purple-950/20 border-purple-800/40 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'
                    }`}>
                      <div>
                        <div className="text-xs font-bold font-mono text-purple-400">{'{{' + vk + '}}'}</div>
                        <div className="text-xs font-mono text-slate-300 break-all mt-0.5">{String(vv)}</div>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(String(vv))}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Copy variable value"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CUSTOM ENVIRONMENT MANAGEMENT MODAL                                    */}
      {/* ========================================================================= */}
      {showEnvModal && editingEnv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-purple-400" />
                <h3 className="text-sm font-bold">
                  {editingEnv.id ? 'Edit Custom Environment' : 'Create Custom Environment'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowEnvModal(false);
                  setEditingEnv(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Environment Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. QA-Cluster-02 or UAT-Gateway"
                  value={editingEnv.name}
                  onChange={(e) => setEditingEnv({ ...editingEnv, name: e.target.value })}
                  className={`w-full text-xs font-semibold px-3 py-2 rounded-lg border focus:outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Dynamic Variables Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300">
                    Environment Variables (Key-Value)
                  </label>
                  <button
                    onClick={() => {
                      const newVars = { ...(editingEnv.variables || {}), [`var_${Date.now()}`]: '' };
                      setEditingEnv({ ...editingEnv, variables: newVars });
                    }}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    <Plus size={12} />
                    <span>Add Variable</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {Object.entries(editingEnv.variables || {}).map(([key, val], vIdx) => (
                    <div key={vIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Variable Key (e.g. baseUrl)"
                        value={key}
                        onChange={(e) => {
                          const newKey = e.target.value;
                          const newVars = {};
                          Object.entries(editingEnv.variables).forEach(([k, v]) => {
                            if (k === key) {
                              newVars[newKey] = v;
                            } else {
                              newVars[k] = v;
                            }
                          });
                          setEditingEnv({ ...editingEnv, variables: newVars });
                        }}
                        className={`w-1/3 text-xs font-mono px-2.5 py-1.5 rounded border focus:outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-700 text-purple-300 font-bold' : 'bg-white border-slate-300 text-purple-800 font-bold'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Variable Value"
                        value={val}
                        onChange={(e) => {
                          setEditingEnv({
                            ...editingEnv,
                            variables: { ...editingEnv.variables, [key]: e.target.value }
                          });
                        }}
                        className={`flex-1 text-xs font-mono px-2.5 py-1.5 rounded border focus:outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                      <button
                        onClick={() => {
                          const newVars = { ...editingEnv.variables };
                          delete newVars[key];
                          setEditingEnv({ ...editingEnv, variables: newVars });
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400"
                        title="Delete variable"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {envSaveStatus && (
                <div className={`p-2.5 rounded-lg text-xs font-semibold ${
                  envSaveStatus.type === 'error' ? 'bg-rose-950/40 border border-rose-800 text-rose-300' : 'bg-purple-950/40 text-purple-300'
                }`}>
                  {envSaveStatus.message}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-between ${
              isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
            }`}>
              {editingEnv.id ? (
                <button
                  onClick={(e) => {
                    handleDeleteCustomEnv(editingEnv.id, e);
                    setShowEnvModal(false);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
                >
                  <Trash2 size={13} />
                  <span>Delete Environment</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowEnvModal(false);
                    setEditingEnv(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustomEnv}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md transition-all"
                >
                  <Save size={13} />
                  <span>{editingEnv.id ? 'Save Changes' : 'Create Environment'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TEMPLATES & QUICK REFERENCE SNIPPETS DRAWER                              */}
      {/* ========================================================================= */}
      <SnippetDrawer
        isOpen={showSnippetDrawer}
        onClose={() => setShowSnippetDrawer(false)}
        onApplySnippet={handleApplySnippet}
        onInsertVariable={handleInsertVariable}
        runtimeVars={runtimeVars}
        activeEnv={activeEnv}
        isDarkMode={isDarkMode}
        projectId={projectId}
        activeStepName={activeStep ? activeStep.name : 'Step 1'}
      />
    </div>
  );
}
