/**
 * API Execution Engine for Browser-Direct HTTP Execution
 * 
 * Executes requests directly from the client using native fetch() without proxy.
 * Features:
 * - Template variable interpolation with nested path support ({{auth.token}})
 * - Built-in dynamic variable generators ({{$guid}}, {{$timestamp}}, etc.)
 * - Sub-millisecond latency tracking and payload size measurement
 * - JSONPath / dot-notation dynamic variable extraction
 * - Resilient error handling (CORS, network unreachable)
 * - Sequential chained pipeline execution with early halting
 * - cURL command generation
 */

// Built-in dynamic variable generators
export const BUILTIN_DYNAMIC_GENERATORS = {
  '$guid': () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'id_' + Math.random().toString(36).substring(2, 9)),
  '$uuid': () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'id_' + Math.random().toString(36).substring(2, 9)),
  '$timestamp': () => Math.floor(Date.now() / 1000).toString(),
  '$isoTimestamp': () => new Date().toISOString(),
  '$randomInt': () => Math.floor(Math.random() * 100000).toString(),
  '$randomEmail': () => `user_${Math.random().toString(36).substring(2, 7)}@bankalhabib.com`
};

/**
 * Extracts a nested value from a JavaScript object or array using dot/bracket notation.
 * e.g. "auth.token", "items[0].id", "data.user.roles[1]"
 * 
 * @param {Object} obj Target object or array
 * @param {string} path Path expression
 * @returns {*} Extracted value or undefined
 */
export function extractJsonPath(obj, path) {
  if (!obj || !path || typeof path !== 'string') return undefined;
  
  // Normalize bracket notation: items[0].id -> items.0.id
  const parts = path.trim().replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }

  return current;
}

/**
 * Replaces {{variableName}} in string with matching values from variablesMap or built-ins.
 * Supports nested object access (e.g. {{auth.token}}) and dynamic tokens ({{$guid}}).
 * 
 * @param {string} templateString Input string with placeholders
 * @param {Object} variablesMap Key-value mapping of variables
 * @returns {string} Interpolated string
 */
export function interpolate(templateString, variablesMap = {}) {
  if (typeof templateString !== 'string') return templateString;

  return templateString.replace(/\{\{\s*([a-zA-Z0-9_$.-]+)\s*\}\}/g, (match, key) => {
    // 1. Built-in dynamic tokens
    if (BUILTIN_DYNAMIC_GENERATORS[key]) {
      return BUILTIN_DYNAMIC_GENERATORS[key]();
    }

    // 2. Direct flat lookup
    if (variablesMap[key] !== undefined && variablesMap[key] !== null) {
      return String(variablesMap[key]);
    }

    // 3. Nested path resolution (e.g. auth.token)
    const nested = extractJsonPath(variablesMap, key);
    if (nested !== undefined && nested !== null) {
      return typeof nested === 'object' ? JSON.stringify(nested) : String(nested);
    }

    // Return original placeholder if unresolvable
    return match;
  });
}

/**
 * Executes a single API step directly in the browser using native fetch().
 * 
 * @param {Object} stepConfig Step configuration { method, url, headers, params, body, extractionRules }
 * @param {Object} envVars Environment variables
 * @param {Object} runtimeContext Extracted runtime variables from preceding steps
 * @returns {Promise<Object>} Execution result object
 */
export async function executeSingleStep(stepConfig, envVars = {}, runtimeContext = {}) {
  const mergedContext = { ...envVars, ...runtimeContext };
  const startTime = performance.now();
  const stepId = stepConfig.id || 'step_' + Date.now();

  try {
    // 1. Interpolate URL
    let targetUrl = interpolate(stepConfig.url || '', mergedContext);

    // 2. Interpolate & Append Query Parameters
    if (Array.isArray(stepConfig.params) && stepConfig.params.length > 0) {
      const enabledParams = stepConfig.params.filter(p => p && p.enabled && p.key);
      if (enabledParams.length > 0) {
        let base = targetUrl;
        let isRelative = !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://');
        if (isRelative) {
          base = `http://127.0.0.1:5000${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
        }
        
        try {
          const urlObj = new URL(base);
          enabledParams.forEach(p => {
            const key = interpolate(p.key, mergedContext);
            const val = interpolate(p.value || '', mergedContext);
            if (key) urlObj.searchParams.set(key, val);
          });
          targetUrl = isRelative ? urlObj.pathname + urlObj.search : urlObj.toString();
        } catch {
          // Fallback simple query append
          const queryString = enabledParams
            .map(p => `${encodeURIComponent(interpolate(p.key, mergedContext))}=${encodeURIComponent(interpolate(p.value || '', mergedContext))}`)
            .join('&');
          targetUrl += (targetUrl.includes('?') ? '&' : '?') + queryString;
        }
      }
    }

    // 3. Interpolate Request Headers
    const requestHeaders = {};
    if (Array.isArray(stepConfig.headers)) {
      stepConfig.headers.filter(h => h && h.enabled && h.key).forEach(h => {
        const headerKey = interpolate(h.key, mergedContext);
        const headerVal = interpolate(h.value || '', mergedContext);
        if (headerKey) {
          requestHeaders[headerKey] = headerVal;
        }
      });
    }

    // 4. Interpolate Request Body
    let requestBody = null;
    const method = (stepConfig.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && stepConfig.body) {
      requestBody = interpolate(stepConfig.body, mergedContext);
    }

    // 5. Construct Fetch Options
    const fetchOptions = {
      method,
      headers: requestHeaders
    };
    if (requestBody && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      fetchOptions.body = requestBody;
    }

    // 6. Direct Browser HTTP Execution
    const response = await fetch(targetUrl, fetchOptions);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    // Extract Response Headers
    const responseHeaders = {};
    if (response.headers && typeof response.headers.forEach === 'function') {
      response.headers.forEach((val, key) => {
        responseHeaders[key] = val;
      });
    }

    // Parse Payload (JSON with raw text fallback)
    let rawText = '';
    let responseData = null;
    try {
      rawText = await response.text();
      responseData = JSON.parse(rawText);
    } catch {
      responseData = rawText;
    }

    // Calculate Payload Byte Size
    const byteLength = rawText ? (new TextEncoder().encode(rawText)).length : 0;
    const responseSizeFormatted = (byteLength / 1024).toFixed(2) + ' KB';

    // 7. Perform Dynamic Variable Extractions
    const extractedVariables = {};
    if (Array.isArray(stepConfig.extractionRules) && stepConfig.extractionRules.length > 0 && responseData && typeof responseData === 'object') {
      stepConfig.extractionRules.forEach(rule => {
        if (rule && rule.variableName && rule.jsonPath) {
          const val = extractJsonPath(responseData, rule.jsonPath);
          if (val !== undefined && val !== null) {
            extractedVariables[rule.variableName] = typeof val === 'object' ? JSON.stringify(val) : val;
          }
        }
      });
    }

    const execResult = {
      stepId,
      isExecuting: false,
      response: responseData,
      responseStatus: response.status,
      responseStatusText: response.statusText,
      responseTime,
      responseSize: responseSizeFormatted,
      responseHeaders,
      isError: !response.ok,
      extractedVariables,
      lastExecutedAt: new Date().toISOString()
    };

    return {
      success: response.ok,
      status: response.status,
      extracted: extractedVariables,
      result: execResult
    };

  } catch (err) {
    const endTime = performance.now();
    const errorResult = {
      stepId,
      isExecuting: false,
      response: {
        error: 'Network or CORS failure: ' + (err.message || 'Target server unreachable or cross-origin request blocked.'),
        details: 'Ensure target endpoint is online and exposes permissive CORS headers (Access-Control-Allow-Origin).'
      },
      responseStatus: 0,
      responseStatusText: 'Network / CORS Error',
      responseTime: Math.round(endTime - startTime),
      responseSize: '0.00 KB',
      responseHeaders: {},
      isError: true,
      extractedVariables: {},
      lastExecutedAt: new Date().toISOString()
    };

    return {
      success: false,
      status: 0,
      extracted: {},
      result: errorResult
    };
  }
}

/**
 * Generates an executable cURL command string with interpolated variables.
 * 
 * @param {Object} stepConfig Step configuration
 * @param {Object} variablesMap Context variables
 * @returns {string} Formatted cURL command
 */
export function generateCurlCommand(stepConfig, variablesMap = {}) {
  if (!stepConfig) return '';
  const method = (stepConfig.method || 'GET').toUpperCase();
  const targetUrl = interpolate(stepConfig.url || '', variablesMap);

  let curl = `curl --location --request ${method} '${targetUrl}'`;

  if (Array.isArray(stepConfig.headers)) {
    stepConfig.headers.filter(h => h && h.enabled && h.key).forEach(h => {
      const k = interpolate(h.key, variablesMap);
      const v = interpolate(h.value || '', variablesMap);
      curl += ` \\\n  --header '${k}: ${v}'`;
    });
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && stepConfig.body) {
    const interpolatedBody = interpolate(stepConfig.body, variablesMap).replace(/'/g, "'\\''");
    curl += ` \\\n  --data-raw '${interpolatedBody}'`;
  }

  return curl;
}

/**
 * Runs a chained sequence of pipeline steps sequentially.
 * Passes extracted variables from earlier steps into subsequent steps.
 * Halts immediately if any step fails.
 * 
 * @param {Array<Object>} steps List of steps to execute
 * @param {Object} envVars Environment variables
 * @param {Object} options Options { onStepStart, onStepFinish, delayBetweenSteps }
 * @returns {Promise<Object>} Execution summary { success, completedSteps, totalSteps, accumulatedVariables, finalStatus }
 */
export async function runChainedPipeline(steps, envVars = {}, options = {}) {
  const {
    onStepStart = () => {},
    onStepFinish = () => {},
    delayBetweenSteps = 300
  } = options;

  let accumulatedVariables = { ...envVars };
  let extractedRuntime = {};

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    onStepStart(step, i, accumulatedVariables);

    const execOutcome = await executeSingleStep(step, envVars, extractedRuntime);
    onStepFinish(step, i, execOutcome);

    // Halt immediately on non-2xx status code or network error
    if (!execOutcome.success) {
      return {
        success: false,
        failedStepIndex: i,
        failedStep: step,
        completedSteps: i,
        totalSteps: steps.length,
        accumulatedVariables,
        extractedRuntime,
        lastResult: execOutcome.result
      };
    }

    // Merge extracted variables for downstream steps
    if (execOutcome.extracted && Object.keys(execOutcome.extracted).length > 0) {
      extractedRuntime = { ...extractedRuntime, ...execOutcome.extracted };
      accumulatedVariables = { ...accumulatedVariables, ...execOutcome.extracted };
    }

    if (i < steps.length - 1 && delayBetweenSteps > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenSteps));
    }
  }

  return {
    success: true,
    completedSteps: steps.length,
    totalSteps: steps.length,
    accumulatedVariables,
    extractedRuntime
  };
}
