import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Copy,
  Check,
  Plus,
  Trash2,
  Settings2,
  Sliders,
  Terminal,
  Code2,
  ChevronRight,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Zap,
  Layers,
  Sparkles,
  Database,
  Globe
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

const DEFAULT_ENVIRONMENTS = [
  {
    id: 'local',
    name: 'Local Backend',
    variables: [
      { key: 'baseUrl', value: 'http://127.0.0.1:5000/api' },
      { key: 'adminEmail', value: 'admin@bankalhabib.com' },
      { key: 'adminPassword', value: 'Admin123!' },
      { key: 'department', value: 'Software Engineering' }
    ]
  },
  {
    id: 'development',
    name: 'Development (Sandbox)',
    variables: [
      { key: 'baseUrl', value: 'https://dev-api.bankalhabib.com/api' },
      { key: 'apiKey', value: 'bahl_dev_sec_991823' },
      { key: 'adminEmail', value: 'dev.lead@bankalhabib.com' }
    ]
  },
  {
    id: 'staging',
    name: 'Staging (UAT)',
    variables: [
      { key: 'baseUrl', value: 'https://staging-api.bankalhabib.com/api' },
      { key: 'apiKey', value: 'bahl_stg_sec_772183' }
    ]
  },
  {
    id: 'production',
    name: 'Production (Live)',
    variables: [
      { key: 'baseUrl', value: 'https://api.bankalhabib.com/api' },
      { key: 'apiKey', value: 'bahl_prod_sec_001923' }
    ]
  }
];

export default function ApiStudio({ onBack, isDarkMode, authUser }) {
  // Environments state
  const [environments, setEnvironments] = useState(() => {
    const saved = localStorage.getItem('api_studio_envs');
    return saved ? JSON.parse(saved) : DEFAULT_ENVIRONMENTS;
  });
  const [activeEnvId, setActiveEnvId] = useState('local');
  const [showEnvModal, setShowEnvModal] = useState(false);

  // Runtime extracted variables from Step 1 execution
  const [runtimeVars, setRuntimeVars] = useState({});

  // Active step selected in workspace: 1 or 2
  const [activeStep, setActiveStep] = useState(1);

  // Request sub-tab in workspace: 'params' | 'headers' | 'body' | 'extraction'
  const [reqTab, setReqTab] = useState('body');

  // Response sub-tab: 'body' | 'headers' | 'extracted'
  const [resTab, setResTab] = useState('body');

  // Step 1 configuration (Setup / Auth)
  const [step1, setStep1] = useState({
    name: '1. Authenticate & Obtain Dynamic Token',
    method: 'POST',
    url: '{{baseUrl}}/auth/login',
    headers: [
      { id: 'h1', enabled: true, key: 'Content-Type', value: 'application/json' },
      { id: 'h2', enabled: true, key: 'Accept', value: 'application/json' }
    ],
    params: [],
    body: JSON.stringify({
      email: '{{adminEmail}}',
      password: '{{adminPassword}}'
    }, null, 2),
    extractionRules: [
      { id: 'ex1', targetVar: 'step1_token', sourcePath: 'token', description: 'JWT Token for Downstream Authorization' }
    ]
  });

  // Step 2 configuration (Dependent / Downstream)
  const [step2, setStep2] = useState({
    name: '2. Query Projects & Workspaces (Downstream)',
    method: 'GET',
    url: '{{baseUrl}}/projects',
    headers: [
      { id: 'h1', enabled: true, key: 'Authorization', value: 'Bearer {{step1_token}}' },
      { id: 'h2', enabled: true, key: 'Accept', value: 'application/json' }
    ],
    params: [
      { id: 'p1', enabled: true, key: 'include_metadata', value: 'true' }
    ],
    body: ''
  });

  // Execution states
  const [step1Result, setStep1Result] = useState(null);
  const [step2Result, setStep2Result] = useState(null);
  const [isExecutingStep1, setIsExecutingStep1] = useState(false);
  const [isExecutingStep2, setIsExecutingStep2] = useState(false);

  // Chained Pipeline Runner state
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [pipelineLogs, setPipelineLogs] = useState([]);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Persist environments
  useEffect(() => {
    localStorage.setItem('api_studio_envs', JSON.stringify(environments));
  }, [environments]);

  const activeEnv = environments.find(e => e.id === activeEnvId) || environments[0];

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

  // Interpolation function replacing {{varName}}
  const interpolate = (text) => {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, varName) => {
      if (runtimeVars[varName] !== undefined) {
        return runtimeVars[varName];
      }
      const envVar = activeEnv.variables.find(v => v.key === varName);
      if (envVar) return envVar.value;
      return match;
    });
  };

  // Check if Step 1 succeeded (HTTP 200-299) and extracted required variables
  const isStep1Success = step1Result && step1Result.status_code >= 200 && step1Result.status_code < 300;
  const isStep2Unlocked = isStep1Success && !!runtimeVars.step1_token;

  // Execute single request via server-side proxy
  const executeRequest = async (stepNumber, customRuntime = runtimeVars) => {
    const isStep1 = stepNumber === 1;
    const config = isStep1 ? step1 : step2;
    const setExecuting = isStep1 ? setIsExecutingStep1 : setIsExecutingStep2;
    const setResult = isStep1 ? setStep1Result : setStep2Result;

    setExecuting(true);

    try {
      // 1. Resolve URL
      let resolvedUrl = config.url.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (m, key) => {
        if (customRuntime[key] !== undefined) return customRuntime[key];
        const v = activeEnv.variables.find(item => item.key === key);
        return v ? v.value : m;
      });

      // 2. Resolve Headers
      const resolvedHeaders = {};
      config.headers.filter(h => h.enabled && h.key.trim()).forEach(h => {
        const resolvedVal = h.value.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (m, key) => {
          if (customRuntime[key] !== undefined) return customRuntime[key];
          const v = activeEnv.variables.find(item => item.key === key);
          return v ? v.value : m;
        });
        resolvedHeaders[h.key.trim()] = resolvedVal;
      });

      // 3. Resolve Query Params
      const resolvedParams = {};
      config.params.filter(p => p.enabled && p.key.trim()).forEach(p => {
        const resolvedVal = p.value.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (m, key) => {
          if (customRuntime[key] !== undefined) return customRuntime[key];
          const v = activeEnv.variables.find(item => item.key === key);
          return v ? v.value : m;
        });
        resolvedParams[p.key.trim()] = resolvedVal;
      });

      // 4. Resolve Body
      let resolvedBody = null;
      if (config.method !== 'GET' && config.body) {
        let bodyStr = config.body.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (m, key) => {
          if (customRuntime[key] !== undefined) return customRuntime[key];
          const v = activeEnv.variables.find(item => item.key === key);
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
          method: config.method,
          url: resolvedUrl,
          headers: resolvedHeaders,
          params: resolvedParams,
          body: resolvedBody
        })
      });

      const data = await res.json();
      setResult(data);

      // If Step 1 succeeded, extract variables according to rules
      if (isStep1 && data.status_code >= 200 && data.status_code < 300) {
        const newlyExtracted = { ...customRuntime };
        config.extractionRules.forEach(rule => {
          if (rule.targetVar && rule.sourcePath) {
            const val = getNestedValue(data.data, rule.sourcePath);
            if (val !== undefined) {
              newlyExtracted[rule.targetVar] = val;
            }
          }
        });
        setRuntimeVars(newlyExtracted);
        return { success: true, data, extracted: newlyExtracted };
      }

      return { success: data.status_code >= 200 && data.status_code < 300, data, extracted: customRuntime };

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
      setResult(errPayload);
      return { success: false, data: errPayload, extracted: customRuntime };
    } finally {
      setExecuting(false);
    }
  };

  // Headless Automated Chained Pipeline Runner
  const runChainedPipeline = async () => {
    setIsRunningPipeline(true);
    setPipelineLogs([]);

    const addLog = (msg, type = 'info') => {
      setPipelineLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);
    };

    addLog('🚀 Initializing Chained Pipeline Execution...', 'info');
    addLog(`Environment: ${activeEnv.name} (Base URL: ${activeEnv.variables.find(v => v.key === 'baseUrl')?.value || 'N/A'})`, 'info');

    // 1. Run Step 1
    addLog('Running Step 1: Primary Authentication & Setup Endpoint...', 'info');
    setActiveStep(1);
    const step1Res = await executeRequest(1);

    if (!step1Res.success) {
      addLog(`❌ Step 1 FAILED with HTTP ${step1Res.data.status_code} (${step1Res.data.status_text}).`, 'error');
      addLog('⛔ Pipeline halted immediately. Dependent Step 2 will NOT be executed.', 'error');
      setIsRunningPipeline(false);
      return;
    }

    addLog(`✓ Step 1 Succeeded! HTTP ${step1Res.data.status_code} in ${step1Res.data.time_ms}ms.`, 'success');

    // Verify extraction
    const extractedToken = step1Res.extracted.step1_token;
    if (!extractedToken) {
      addLog(' Step 1 succeeded but dynamic variable {{step1_token}} could not be extracted from response.', 'error');
      addLog(' Pipeline halted: Downstream dependencies cannot be fulfilled.', 'error');
      setIsRunningPipeline(false);
      return;
    }

    addLog(`✓ Successfully extracted dynamic variable: step1_token (${String(extractedToken).substring(0, 18)}...)`, 'success');
    addLog(' Dependency requirement fulfilled: Unlocking Step 2...', 'success');

    // Small sequential pause for realistic visual execution
    await new Promise(r => setTimeout(r, 600));

    // 2. Run Step 2
    addLog('Running Step 2: Dependent Downstream Endpoint...', 'info');
    setActiveStep(2);
    const step2Res = await executeRequest(2, step1Res.extracted);

    if (!step2Res.success) {
      addLog(` Step 2 FAILED with HTTP ${step2Res.data.status_code} (${step2Res.data.status_text}).`, 'error');
      setIsRunningPipeline(false);
      return;
    }

    addLog(`✓ Step 2 Succeeded! HTTP ${step2Res.data.status_code} in ${step2Res.data.time_ms}ms.`, 'success');
    addLog(' Chained Pipeline execution completed successfully with 100% downstream data integrity!', 'success');
    setIsRunningPipeline(false);
  };

  const currentConfig = activeStep === 1 ? step1 : step2;
  const currentResult = activeStep === 1 ? step1Result : step2Result;
  const isCurrentExecuting = activeStep === 1 ? isExecutingStep1 : isExecutingStep2;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0b0c16] text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* TOP STUDIO NAVIGATION BAR */}
      <header className={`h-14 border-b px-4 flex items-center justify-between shrink-0 transition ${
        isDarkMode ? 'bg-[#121422] border-zinc-800/80' : 'bg-white border-slate-200 shadow-xs'
      }`}>
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

          {/* Logo & Title */}
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/95 border border-emerald-500/30 p-0.5 flex items-center justify-center shadow-xs">
              <img src={bahlLogo} alt="Bank AL Habib" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight">API Execution Studio</span>
                <span className="text-[9.5px] font-black tracking-wider uppercase px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  API Engine
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Environment Switcher */}
          <div className="flex items-center space-x-1">
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs ${
              isDarkMode ? 'bg-[#16182a] border-zinc-800 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <Globe className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <select
                value={activeEnvId}
                onChange={e => setActiveEnvId(e.target.value)}
                className="bg-transparent font-bold text-xs focus:outline-hidden cursor-pointer"
              >
                {environments.map(env => (
                  <option key={env.id} value={env.id} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-slate-900'}>
                    {env.name}
                  </option>
                ))}
              </select>
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

          {/* Run Chained Pipeline Button */}
          <button
            onClick={runChainedPipeline}
            disabled={isRunningPipeline}
            className={`text-xs font-black px-3.5 py-1.5 rounded-xl border flex items-center space-x-1.5 transition shadow-sm cursor-pointer ${
              isRunningPipeline
                ? 'bg-purple-700 text-white opacity-80 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400/30 shadow-purple-950/40'
            }`}
            title="Execute Step 1 -> Extract Dynamic Output -> Inject -> Execute Step 2"
          >
            {isRunningPipeline ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Running Pipeline...</span>
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

      {/* MAIN STUDIO WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR: Sequential Pipeline Navigator & Dynamic Variables */}
        <aside className={`w-72 sm:w-80 border-r flex flex-col shrink-0 overflow-y-auto ${
          isDarkMode ? 'bg-[#101220] border-zinc-800/80' : 'bg-white border-slate-200'
        }`}>
          {/* Pipeline Sequential Header */}
          <div className="p-3.5 border-b flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Layers className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Chained Pipeline</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">2 Steps</span>
          </div>

          {/* Sequential Steps List */}
          <div className="p-3 space-y-2">
            
            {/* STEP 1: Primary Setup */}
            <div
              id="pipeline-step-1"
              onClick={() => setActiveStep(1)}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                activeStep === 1
                  ? isDarkMode
                    ? 'bg-[#181a30] border-purple-500/50 shadow-md shadow-purple-950/20'
                    : 'bg-violet-50/80 border-violet-300 shadow-xs'
                  : isDarkMode
                    ? 'bg-[#141626] border-zinc-800/80 hover:border-zinc-700'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black border uppercase tracking-wider ${METHOD_COLORS[step1.method].bg}`}>
                    {step1.method}
                  </span>
                  <span className="text-xs font-extrabold truncate">Step 1: Auth / Setup</span>
                </div>
                {isStep1Success ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>200</span>
                  </span>
                ) : step1Result ? (
                  <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    <span>{step1Result.status_code}</span>
                  </span>
                ) : (
                  <span className="text-[9.5px] font-semibold text-zinc-500">READY</span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 truncate mt-1 font-mono">{step1.url}</p>
              
              <div className="mt-2 pt-2 border-t flex items-center justify-between text-[10px]">
                <span className="text-purple-400 font-semibold flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5" />
                  <span>Extracts: 1 variable</span>
                </span>
                <span className="font-mono text-zinc-400">{runtimeVars.step1_token ? '✓ Resolved' : 'Pending run'}</span>
              </div>
            </div>

            {/* PIPELINE LINKER ARROW */}
            <div className="flex items-center justify-center py-0.5">
              <div className="flex items-center space-x-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <ChevronRight className="h-3 w-3 rotate-90" />
                <span>Injects Dynamic Output</span>
              </div>
            </div>

            {/* STEP 2: Dependent Downstream */}
            <div
              id="pipeline-step-2"
              onClick={() => setActiveStep(2)}
              className={`p-3 rounded-xl border transition cursor-pointer relative ${
                activeStep === 2
                  ? isDarkMode
                    ? 'bg-[#181a30] border-purple-500/50 shadow-md shadow-purple-950/20'
                    : 'bg-violet-50/80 border-violet-300 shadow-xs'
                  : isDarkMode
                    ? 'bg-[#141626] border-zinc-800/80 hover:border-zinc-700'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black border uppercase tracking-wider ${METHOD_COLORS[step2.method].bg}`}>
                    {step2.method}
                  </span>
                  <span className="text-xs font-extrabold truncate">Step 2: Downstream</span>
                </div>
                
                {/* Lock Status Badge */}
                {isStep2Unlocked ? (
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Unlock className="h-2.5 w-2.5" />
                    <span>UNLOCKED</span>
                  </span>
                ) : (
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" />
                    <span>LOCKED</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 truncate mt-1 font-mono">{step2.url}</p>

              <div className="mt-2 pt-2 border-t flex items-center justify-between text-[10px]">
                <span className="text-zinc-400">Depends on:</span>
                <span className="font-mono text-violet-400 font-bold">Bearer {'{{step1_token}}'}</span>
              </div>
            </div>

          </div>

          {/* DYNAMIC RUNTIME VARIABLES INSPECTOR */}
          <div className="p-3.5 border-t mt-auto space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Database className="h-3 w-3 text-purple-400" />
                <span>Runtime Context</span>
              </span>
              <button
                onClick={() => setRuntimeVars({})}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                title="Reset extracted variables"
              >
                Clear
              </button>
            </div>

            {Object.keys(runtimeVars).length === 0 ? (
              <p className="text-[11px] text-zinc-500 italic p-2 rounded bg-zinc-900/30 border border-dashed border-zinc-800">
                No variables extracted yet. Execute Step 1 to populate dynamic token and IDs.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {Object.entries(runtimeVars).map(([k, v]) => (
                  <div key={k} className="p-2 rounded-lg bg-purple-950/25 border border-purple-800/30 text-xs">
                    <span className="font-mono text-[10px] font-bold text-purple-400 block truncate">{`{{${k}}}`}</span>
                    <span className="font-mono text-[10px] text-zinc-300 block truncate mt-0.5">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PIPELINE CONSOLE LOG ACCORDION */}
          {pipelineLogs.length > 0 && (
            <div className={`p-3 border-t text-xs font-mono max-h-44 overflow-y-auto ${
              isDarkMode ? 'bg-[#090a12]' : 'bg-slate-100'
            }`}>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-bold mb-1.5">
                <span>Execution Log</span>
                <button onClick={() => setPipelineLogs([])} className="hover:text-zinc-200">Clear</button>
              </div>
              <div className="space-y-1">
                {pipelineLogs.map((log, idx) => (
                  <div key={idx} className={`text-[10px] ${
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

        {/* WORKSPACE AREA: REQUEST BUILDER (TOP/LEFT) & RESPONSE VIEWER (BOTTOM/RIGHT) */}
        <main className="flex-1 flex flex-col overflow-hidden">
          
          {/* STEP 2 STRICT DEPENDENCY LOCK OVERLAY */}
          {activeStep === 2 && !isStep2Unlocked ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div className={`max-w-md p-8 rounded-2xl border space-y-4 shadow-xl ${
                isDarkMode ? 'bg-[#131526] border-amber-500/30' : 'bg-white border-amber-300'
              }`}>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                  <Lock className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-amber-400">
                    Step 2 is Strictly Locked
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    This downstream endpoint depends on dynamic outputs from Step 1 (<code className="text-purple-400 font-mono">{'{{step1_token}}'}</code>). 
                    You must execute Step 1 successfully (HTTP 200–299) before Step 2 can be dispatched.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setActiveStep(1);
                      executeRequest(1);
                    }}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-purple-950/40 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run Step 1 to Unlock</span>
                  </button>
                  <button
                    onClick={() => setActiveStep(1)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border transition cursor-pointer ${
                      isDarkMode ? 'border-zinc-750 text-zinc-300 hover:bg-zinc-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Inspect Step 1
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* LEFT HALF: REQUEST BUILDER */}
              <section className="flex-1 flex flex-col border-b md:border-b-0 md:border-r overflow-hidden">
                
                {/* Method & URL Address Bar */}
                <div className={`p-3 border-b flex items-center space-x-2 ${
                  isDarkMode ? 'bg-[#121424] border-zinc-800/80' : 'bg-slate-100/70 border-slate-200'
                }`}>
                  {/* Method Selector */}
                  <select
                    value={currentConfig.method}
                    onChange={e => {
                      const newMethod = e.target.value;
                      if (activeStep === 1) setStep1(s => ({ ...s, method: newMethod }));
                      else setStep2(s => ({ ...s, method: newMethod }));
                    }}
                    className={`font-black text-xs px-3 py-2 rounded-xl border focus:outline-hidden cursor-pointer ${METHOD_COLORS[currentConfig.method].bg}`}
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
                      value={currentConfig.url}
                      onChange={e => {
                        const newUrl = e.target.value;
                        if (activeStep === 1) setStep1(s => ({ ...s, url: newUrl }));
                        else setStep2(s => ({ ...s, url: newUrl }));
                      }}
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
                    onClick={() => executeRequest(activeStep)}
                    disabled={isCurrentExecuting}
                    className={`text-xs font-black px-4 py-2 rounded-xl border flex items-center space-x-1.5 transition shadow-sm cursor-pointer ${
                      isCurrentExecuting
                        ? 'opacity-60 cursor-not-allowed'
                        : METHOD_COLORS[currentConfig.method].btn
                    }`}
                  >
                    {isCurrentExecuting ? (
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

                {/* Sub-Navigation Tabs */}
                <div className={`flex items-center px-3 border-b text-xs space-x-4 ${
                  isDarkMode ? 'bg-[#101220] border-zinc-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  {[
                    { id: 'body', label: 'Body' },
                    { id: 'headers', label: `Headers (${currentConfig.headers.filter(h => h.enabled).length})` },
                    { id: 'params', label: `Params (${currentConfig.params.filter(p => p.enabled).length})` },
                    ...(activeStep === 1 ? [{ id: 'extraction', label: 'Variable Extraction Rules' }] : [])
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
                              const parsed = JSON.parse(currentConfig.body);
                              const formatted = JSON.stringify(parsed, null, 2);
                              if (activeStep === 1) setStep1(s => ({ ...s, body: formatted }));
                              else setStep2(s => ({ ...s, body: formatted }));
                            } catch {
                              // Ignore formatting error
                            }
                          }}
                          className="text-purple-400 hover:underline cursor-pointer"
                        >
                          Prettify JSON
                        </button>
                      </div>

                      <textarea
                        value={currentConfig.body}
                        onChange={e => {
                          const val = e.target.value;
                          if (activeStep === 1) setStep1(s => ({ ...s, body: val }));
                          else setStep2(s => ({ ...s, body: val }));
                        }}
                        rows={12}
                        placeholder="{\n  &quot;key&quot;: &quot;value&quot;\n}"
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
                            if (activeStep === 1) setStep1(s => ({ ...s, headers: [...s.headers, newHeader] }));
                            else setStep2(s => ({ ...s, headers: [...s.headers, newHeader] }));
                          }}
                          className="text-xs text-purple-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Header</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {currentConfig.headers.map((h, idx) => (
                          <div key={h.id || idx} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={h.enabled}
                              onChange={e => {
                                const headers = [...currentConfig.headers];
                                headers[idx].enabled = e.target.checked;
                                if (activeStep === 1) setStep1(s => ({ ...s, headers }));
                                else setStep2(s => ({ ...s, headers }));
                              }}
                              className="rounded border-zinc-700 text-purple-600 focus:ring-0 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={h.key}
                              placeholder="Header key (e.g. Authorization)"
                              onChange={e => {
                                const headers = [...currentConfig.headers];
                                headers[idx].key = e.target.value;
                                if (activeStep === 1) setStep1(s => ({ ...s, headers }));
                                else setStep2(s => ({ ...s, headers }));
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
                                const headers = [...currentConfig.headers];
                                headers[idx].value = e.target.value;
                                if (activeStep === 1) setStep1(s => ({ ...s, headers }));
                                else setStep2(s => ({ ...s, headers }));
                              }}
                              className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border font-mono ${
                                isDarkMode ? 'bg-[#0f101d] border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                            <button
                              onClick={() => {
                                const headers = currentConfig.headers.filter((_, i) => i !== idx);
                                if (activeStep === 1) setStep1(s => ({ ...s, headers }));
                                else setStep2(s => ({ ...s, headers }));
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
                            if (activeStep === 1) setStep1(s => ({ ...s, params: [...s.params, newParam] }));
                            else setStep2(s => ({ ...s, params: [...s.params, newParam] }));
                          }}
                          className="text-xs text-purple-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Query Param</span>
                        </button>
                      </div>

                      {currentConfig.params.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic">No query parameters defined.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {currentConfig.params.map((p, idx) => (
                            <div key={p.id || idx} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={p.enabled}
                                onChange={e => {
                                  const params = [...currentConfig.params];
                                  params[idx].enabled = e.target.checked;
                                  if (activeStep === 1) setStep1(s => ({ ...s, params }));
                                  else setStep2(s => ({ ...s, params }));
                                }}
                                className="rounded border-zinc-700 text-purple-600 focus:ring-0 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={p.key}
                                placeholder="Param name"
                                onChange={e => {
                                  const params = [...currentConfig.params];
                                  params[idx].key = e.target.value;
                                  if (activeStep === 1) setStep1(s => ({ ...s, params }));
                                  else setStep2(s => ({ ...s, params }));
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
                                  const params = [...currentConfig.params];
                                  params[idx].value = e.target.value;
                                  if (activeStep === 1) setStep1(s => ({ ...s, params }));
                                  else setStep2(s => ({ ...s, params }));
                                }}
                                className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border font-mono ${
                                  isDarkMode ? 'bg-[#0f101d] border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              />
                              <button
                                onClick={() => {
                                  const params = currentConfig.params.filter((_, i) => i !== idx);
                                  if (activeStep === 1) setStep1(s => ({ ...s, params }));
                                  else setStep2(s => ({ ...s, params }));
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

                  {/* VARIABLE EXTRACTION TAB (Step 1 only) */}
                  {reqTab === 'extraction' && activeStep === 1 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Response Variable Extraction</h4>
                          <p className="text-[11px] text-zinc-400">
                            Define keys to automatically extract from Step 1's JSON response and inject into Step 2.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const newRule = { id: Date.now().toString(), targetVar: '', sourcePath: '', description: '' };
                            setStep1(s => ({ ...s, extractionRules: [...s.extractionRules, newRule] }));
                          }}
                          className="text-xs text-purple-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Extraction Rule</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {step1.extractionRules.map((r, idx) => (
                          <div key={r.id || idx} className={`p-3 rounded-xl border space-y-2 ${
                            isDarkMode ? 'bg-[#0f101d] border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
                          }`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9.5px] font-bold uppercase text-zinc-400 mb-0.5">Target Variable Name</label>
                                <input
                                  type="text"
                                  value={r.targetVar}
                                  placeholder="e.g. step1_token"
                                  onChange={e => {
                                    const rules = [...step1.extractionRules];
                                    rules[idx].targetVar = e.target.value;
                                    setStep1(s => ({ ...s, extractionRules: rules }));
                                  }}
                                  className={`w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border ${
                                    isDarkMode ? 'bg-[#151728] border-zinc-700 text-purple-300' : 'bg-slate-50 border-slate-300 text-purple-700'
                                  }`}
                                />
                              </div>

                              <div>
                                <label className="block text-[9.5px] font-bold uppercase text-zinc-400 mb-0.5">JSON Key / Path in Response</label>
                                <input
                                  type="text"
                                  value={r.sourcePath}
                                  placeholder="e.g. token or user.id"
                                  onChange={e => {
                                    const rules = [...step1.extractionRules];
                                    rules[idx].sourcePath = e.target.value;
                                    setStep1(s => ({ ...s, extractionRules: rules }));
                                  }}
                                  className={`w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border ${
                                    isDarkMode ? 'bg-[#151728] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <span className="text-zinc-500">
                                Current Extracted Value:{' '}
                                <strong className="font-mono text-emerald-400">
                                  {runtimeVars[r.targetVar] !== undefined ? String(runtimeVars[r.targetVar]) : '(not extracted yet)'}
                                </strong>
                              </span>
                              <button
                                onClick={() => {
                                  const rules = step1.extractionRules.filter((_, i) => i !== idx);
                                  setStep1(s => ({ ...s, extractionRules: rules }));
                                }}
                                className="text-zinc-500 hover:text-rose-400 text-xs transition cursor-pointer"
                              >
                                Remove Rule
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
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
                      // className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                      //   isDarkMode ? 'border-zinc-750 hover:bg-zinc-800 text-zinc-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                      // }`}
                    >
                      {/* {copiedResponse ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedResponse ? 'Copied' : 'Copy'}</span> */}
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
                    ...(activeStep === 1 ? [{ id: 'extracted', label: 'Dynamic Extracted Variables' }] : [])
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
                        <p className="text-xs text-zinc-500">No variables extracted from this response.</p>
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

            </div>
          )}

        </main>
      </div>

      {/* ENVIRONMENT MANAGEMENT MODAL */}
      {showEnvModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-4 transition ${
            isDarkMode ? 'bg-[#121422] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
                <Globe className="h-4.5 w-4.5" />
                <span>Environment & Variable Management</span>
              </h3>
              <button onClick={() => setShowEnvModal(false)} className="text-zinc-500 hover:text-zinc-300">
                ✕
              </button>
            </div>

            {/* Environment Selector Tabs */}
            <div className="flex flex-wrap gap-2 border-b pb-2">
              {environments.map(env => (
                <button
                  key={env.id}
                  onClick={() => setActiveEnvId(env.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeEnvId === env.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : isDarkMode
                        ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {env.name}
                </button>
              ))}
            </div>

            {/* Variables Table for Active Environment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Key-Value Pairs</span>
                <button
                  onClick={() => {
                    const updated = environments.map(e => {
                      if (e.id === activeEnvId) {
                        return { ...e, variables: [...e.variables, { key: '', value: '' }] };
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
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {activeEnv.variables.map((v, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={v.key}
                      placeholder="Variable name"
                      onChange={e => {
                        const updated = environments.map(env => {
                          if (env.id === activeEnvId) {
                            const vars = [...env.variables];
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
                      placeholder="Value"
                      onChange={e => {
                        const updated = environments.map(env => {
                          if (env.id === activeEnvId) {
                            const vars = [...env.variables];
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
                            return { ...env, variables: env.variables.filter((_, i) => i !== idx) };
                          }
                          return env;
                        });
                        setEnvironments(updated);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setShowEnvModal(false)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
