import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  executeSingleStep,
  runChainedPipeline,
  generateCurlCommand,
  interpolate,
  extractJsonPath,
  BUILTIN_DYNAMIC_GENERATORS
} from '../utils/apiExecutionEngine';

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

export function createDefaultStep(stepNumber) {
  return {
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
  };
}

/**
 * Custom React Hook for API Pipeline Management and Direct Browser HTTP Execution
 * 
 * @param {Object} options Configuration { projectId, initialSteps, autoLoad = true }
 */
export function useApiPipeline({ projectId = 1, autoLoad = true } = {}) {
  const [steps, setSteps] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [customEnvironments, setCustomEnvironments] = useState([]);
  const [activeEnvId, setActiveEnvId] = useState('local');
  const [runtimeVars, setRuntimeVars] = useState({});
  const [stepExecutions, setStepExecutions] = useState({});
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState({ current: 0, total: 0, status: 'idle' });
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(false);
  const [isSavingPipeline, setIsSavingPipeline] = useState(false);
  const [pipelineSaveStatus, setPipelineSaveStatus] = useState(null);

  // Filtered custom environments to avoid duplication
  const filteredCustomEnvs = useMemo(() => {
    return customEnvironments.filter(e => !BUILTIN_NAMES.has(e.name) && !['local', 'dev', 'staging', 'prod'].includes(String(e.id)));
  }, [customEnvironments]);

  // Merged environments list
  const allEnvironments = useMemo(() => {
    return [...BUILTIN_ENVIRONMENTS, ...filteredCustomEnvs];
  }, [filteredCustomEnvs]);

  // Active environment
  const activeEnv = useMemo(() => {
    return allEnvironments.find(e => String(e.id) === String(activeEnvId)) || BUILTIN_ENVIRONMENTS[0];
  }, [allEnvironments, activeEnvId]);

  // Combined available variables: Active environment variables + runtime extracted variables
  const mergedVariables = useMemo(() => {
    return {
      ...(activeEnv?.variables || {}),
      ...runtimeVars
    };
  }, [activeEnv, runtimeVars]);

  // Active step object and execution state
  const activeStep = steps[activeStepIndex] || steps[0] || null;
  const activeStepExec = activeStep ? (stepExecutions[activeStep.id] || {}) : {};

  // Fetch Custom Environments for Project
  const fetchEnvironments = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/projects/${projectId}/api-environments`, {
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
    }
  }, [projectId]);

  // Fetch Pipeline for Project
  const fetchPipeline = useCallback(async () => {
    try {
      setIsLoadingPipeline(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/projects/${projectId}/api-pipeline`, {
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
    if (autoLoad) {
      fetchEnvironments();
      fetchPipeline();
      setRuntimeVars({});
      setStepExecutions({});
      setActiveStepIndex(0);
    }
  }, [projectId, autoLoad, fetchEnvironments, fetchPipeline]);

  // Execute a single step with provided context variables
  const executeStep = useCallback(async (stepToExecute, overrideContext = null) => {
    const step = stepToExecute || activeStep;
    if (!step) return null;

    const stepId = step.id;
    setStepExecutions(prev => ({
      ...prev,
      [stepId]: { ...(prev[stepId] || {}), isExecuting: true, isError: false }
    }));

    const context = overrideContext || mergedVariables;
    const outcome = await executeSingleStep(step, context, {});

    setStepExecutions(prev => ({
      ...prev,
      [stepId]: outcome.result
    }));

    if (outcome.extracted && Object.keys(outcome.extracted).length > 0) {
      setRuntimeVars(prev => ({ ...prev, ...outcome.extracted }));
    }

    return outcome;
  }, [activeStep, mergedVariables]);

  // Run full chained multi-step pipeline sequentially
  const runPipeline = useCallback(async () => {
    if (steps.length === 0 || isPipelineRunning) return;
    setIsPipelineRunning(true);
    setPipelineProgress({ current: 0, total: steps.length, status: 'running' });

    let currentContext = { ...(activeEnv?.variables || {}) };
    let accumulatedRuntime = {};

    for (let i = 0; i < steps.length; i++) {
      setPipelineProgress({ current: i + 1, total: steps.length, status: 'running' });
      setActiveStepIndex(i);

      const step = steps[i];
      const mergedForStep = { ...currentContext, ...accumulatedRuntime };

      setStepExecutions(prev => ({
        ...prev,
        [step.id]: { ...(prev[step.id] || {}), isExecuting: true, isError: false }
      }));

      const outcome = await executeSingleStep(step, mergedForStep, {});

      setStepExecutions(prev => ({
        ...prev,
        [step.id]: outcome.result
      }));

      if (!outcome.success) {
        setPipelineProgress({ current: i + 1, total: steps.length, status: 'failed' });
        setIsPipelineRunning(false);
        return { success: false, failedIndex: i, failedStep: step };
      }

      if (outcome.extracted && Object.keys(outcome.extracted).length > 0) {
        accumulatedRuntime = { ...accumulatedRuntime, ...outcome.extracted };
        currentContext = { ...currentContext, ...outcome.extracted };
        setRuntimeVars(prev => ({ ...prev, ...outcome.extracted }));
      }

      await new Promise(r => setTimeout(r, 350));
    }

    setPipelineProgress({ current: steps.length, total: steps.length, status: 'completed' });
    setIsPipelineRunning(false);
    return { success: true, total: steps.length };
  }, [steps, isPipelineRunning, activeEnv]);

  // Save Pipeline to Backend
  const savePipeline = useCallback(async (updatedSteps = steps) => {
    try {
      setIsSavingPipeline(true);
      setPipelineSaveStatus(null);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/projects/${projectId}/api-pipeline`, {
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
        return true;
      } else {
        setPipelineSaveStatus({ type: 'error', message: 'Failed to save pipeline configuration' });
        return false;
      }
    } catch (err) {
      console.error('Error saving pipeline:', err);
      setPipelineSaveStatus({ type: 'error', message: 'Network error saving pipeline' });
      return false;
    } finally {
      setIsSavingPipeline(false);
    }
  }, [projectId, steps]);

  // Step operations
  const updateActiveStep = useCallback((updatedFields) => {
    setSteps(prev => prev.map((step, idx) => idx === activeStepIndex ? { ...step, ...updatedFields } : step));
  }, [activeStepIndex]);

  const addStep = useCallback(() => {
    const newStep = createDefaultStep(steps.length + 1);
    const updated = [...steps, newStep];
    setSteps(updated);
    setActiveStepIndex(updated.length - 1);
    savePipeline(updated);
    return newStep;
  }, [steps, savePipeline]);

  const deleteStep = useCallback((indexToDelete) => {
    if (steps.length <= 1) return false;
    const updated = steps.filter((_, idx) => idx !== indexToDelete);
    setSteps(updated);
    if (activeStepIndex >= updated.length) {
      setActiveStepIndex(Math.max(0, updated.length - 1));
    }
    savePipeline(updated);
    return true;
  }, [steps, activeStepIndex, savePipeline]);

  const moveStep = useCallback((fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= steps.length) return;
    const updated = [...steps];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setSteps(updated);
    setActiveStepIndex(toIndex);
    savePipeline(updated);
  }, [steps, savePipeline]);

  const getCurlSnippet = useCallback((step = activeStep) => {
    return generateCurlCommand(step, mergedVariables);
  }, [activeStep, mergedVariables]);

  return {
    steps,
    setSteps,
    activeStepIndex,
    setActiveStepIndex,
    activeStep,
    activeStepExec,
    stepExecutions,
    runtimeVars,
    setRuntimeVars,
    allEnvironments,
    activeEnv,
    activeEnvId,
    setActiveEnvId,
    mergedVariables,
    isPipelineRunning,
    pipelineProgress,
    isLoadingPipeline,
    isSavingPipeline,
    pipelineSaveStatus,
    executeStep,
    runPipeline,
    savePipeline,
    updateActiveStep,
    addStep,
    deleteStep,
    moveStep,
    getCurlSnippet,
    fetchPipeline,
    fetchEnvironments,
    interpolate: (str) => interpolate(str, mergedVariables),
    extractJsonPath
  };
}
