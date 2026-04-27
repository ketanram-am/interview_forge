import { runLocalJavascriptJudge } from "./localJudge";

const DEFAULT_JUDGE0_API = "https://ce.judge0.com";
const DEFAULT_PISTON_API = "https://emkc.org/api/v2/piston";

const JUDGE0_API = import.meta.env.VITE_JUDGE0_API_URL?.trim() || DEFAULT_JUDGE0_API;
const PISTON_API = import.meta.env.VITE_PISTON_API_URL?.trim() || DEFAULT_PISTON_API;
const JUDGE0_AUTH_TOKEN = import.meta.env.VITE_JUDGE0_AUTH_TOKEN?.trim();
const EXPLICIT_RUNNER_PROVIDER = import.meta.env.VITE_CODE_RUNNER_PROVIDER?.trim()?.toLowerCase();

const FALLBACK_PISTON_LANGUAGE_CONFIG = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
};

const FALLBACK_JUDGE0_LANGUAGE_IDS = {
  javascript: 102, // JavaScript (Node.js 22.08.0)
  python: 109, // Python (3.13.2)
  java: 91, // Java (JDK 17.0.6)
};

let cachedPistonRuntimesPromise = null;
let cachedJudge0LanguagesPromise = null;

/**
 * @param {string} language - programming language
 * @param {string} code - source code to executed
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code, options = {}) {
  try {
    const localJudgeResult = getLocalJudgeResult(language, code, options.problemId);

    if (localJudgeResult) {
      return localJudgeResult;
    }

    if (getRunnerProvider() === "piston") {
      return await executeWithPiston(language, code);
    }

    return await executeWithJudge0(language, code);
  } catch (error) {
    return {
      success: false,
      error: `Failed to execute code: ${error.message}`,
    };
  }
}

function getRunnerProvider() {
  if (EXPLICIT_RUNNER_PROVIDER === "judge0" || EXPLICIT_RUNNER_PROVIDER === "piston") {
    return EXPLICIT_RUNNER_PROVIDER;
  }

  if (import.meta.env.VITE_PISTON_API_URL?.trim()) {
    return "piston";
  }

  return "judge0";
}

function getLocalJudgeResult(language, code, problemId) {
  if (language !== "javascript" || !problemId) {
    return null;
  }

  return runLocalJavascriptJudge(problemId, code);
}

async function executeWithJudge0(language, code) {
  const languageId = await getJudge0LanguageId(language);

  if (!languageId) {
    return {
      success: false,
      error: `Unsupported language: ${language}`,
    };
  }

  const response = await fetch(`${JUDGE0_API}/submissions?base64_encoded=false&wait=true`, {
    method: "POST",
    headers: getJudge0Headers(),
    body: JSON.stringify({
      source_code: code,
      language_id: languageId,
      cpu_time_limit: 5,
      wall_time_limit: 10,
    }),
  });

  if (!response.ok) {
    const errorMessage = await getJudge0ErrorMessage(response);

    return {
      success: false,
      error: errorMessage,
    };
  }

  const data = await response.json();
  const stdout = data.stdout || "";
  const runtimeError = data.stderr || data.compile_output || data.message;

  if (data.status?.id !== 3 || runtimeError) {
    return {
      success: false,
      output: stdout,
      error: runtimeError || data.status?.description || "Code execution failed.",
    };
  }

  return {
    success: true,
    output: stdout || "No output",
  };
}

async function executeWithPiston(language, code) {
  const languageConfig = await getPistonLanguageConfig(language);

  if (!languageConfig) {
    return {
      success: false,
      error: `Unsupported language: ${language}`,
    };
  }

  const response = await fetch(`${PISTON_API}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language: languageConfig.language,
      version: languageConfig.version,
      files: [
        {
          name: `main.${getFileExtension(language)}`,
          content: code,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorMessage = await getPistonErrorMessage(response);

    return {
      success: false,
      error: errorMessage,
    };
  }

  const data = await response.json();
  const output = data.run.output || "";
  const stderr = data.run.stderr || "";

  if (stderr) {
    return {
      success: false,
      output: output,
      error: stderr,
    };
  }

  return {
    success: true,
    output: output || "No output",
  };
}

function getJudge0Headers() {
  const headers = {
    "Content-Type": "application/json",
  };

  if (JUDGE0_AUTH_TOKEN) {
    headers["X-Auth-Token"] = JUDGE0_AUTH_TOKEN;
  }

  return headers;
}

async function getPistonLanguageConfig(language) {
  const installedRuntimes = await getInstalledPistonRuntimes();

  if (!installedRuntimes.length) {
    return FALLBACK_PISTON_LANGUAGE_CONFIG[language];
  }

  const runtime =
    installedRuntimes.find((item) => item.language === language) ||
    installedRuntimes.find((item) => item.aliases?.includes(language));

  if (!runtime) {
    return FALLBACK_PISTON_LANGUAGE_CONFIG[language];
  }

  return {
    language: runtime.language,
    version: runtime.version,
  };
}

async function getInstalledPistonRuntimes() {
  if (!cachedPistonRuntimesPromise) {
    cachedPistonRuntimesPromise = fetch(`${PISTON_API}/runtimes`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load runtimes");
        }

        return response.json();
      })
      .catch(() => []);
  }

  return cachedPistonRuntimesPromise;
}

async function getJudge0LanguageId(language) {
  const languages = await getJudge0Languages();

  if (!languages.length) {
    return FALLBACK_JUDGE0_LANGUAGE_IDS[language];
  }

  const matchedLanguage = getBestJudge0LanguageMatch(language, languages);
  return matchedLanguage?.id || FALLBACK_JUDGE0_LANGUAGE_IDS[language];
}

async function getJudge0Languages() {
  if (!cachedJudge0LanguagesPromise) {
    cachedJudge0LanguagesPromise = fetch(`${JUDGE0_API}/languages`, {
      headers: JUDGE0_AUTH_TOKEN ? { "X-Auth-Token": JUDGE0_AUTH_TOKEN } : {},
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load Judge0 languages");
        }

        return response.json();
      })
      .catch(() => []);
  }

  return cachedJudge0LanguagesPromise;
}

function getBestJudge0LanguageMatch(language, languages) {
  const candidates = languages
    .map((item) => ({
      id: item.id,
      version: extractJudge0Version(language, item.name),
    }))
    .filter((item) => item.version);

  if (!candidates.length) {
    return null;
  }

  return candidates.sort((left, right) => compareVersions(right.version, left.version))[0];
}

function extractJudge0Version(language, languageName) {
  switch (language) {
    case "javascript": {
      const match = languageName.match(/^JavaScript \(Node\.js ([0-9.]+)\)$/);
      return match?.[1] || null;
    }
    case "python": {
      const match = languageName.match(/^Python \(([0-9.]+)\)$/);
      return match?.[1]?.startsWith("3.") ? match[1] : null;
    }
    case "java": {
      const match = languageName.match(/^Java \((?:JDK |OpenJDK )?([0-9.]+)\)$/);
      return match?.[1] || null;
    }
    default:
      return null;
  }
}

function compareVersions(leftVersion, rightVersion) {
  const leftParts = leftVersion.split(".").map(Number);
  const rightParts = rightVersion.split(".").map(Number);
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = leftParts[index] || 0;
    const rightValue = rightParts[index] || 0;

    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }

  return 0;
}

async function getJudge0ErrorMessage(response) {
  const apiMessage = await getResponseMessage(response);

  if (response.status === 401) {
    return apiMessage || "This Judge0 instance requires authentication. Set VITE_JUDGE0_AUTH_TOKEN or use a public instance like https://ce.judge0.com.";
  }

  return apiMessage || `HTTP error! status: ${response.status}`;
}

async function getPistonErrorMessage(response) {
  const apiMessage = await getResponseMessage(response);

  if (response.status === 401 && apiMessage.includes("whitelist only")) {
    return [
      "Code execution is unavailable because the public Piston API is now whitelist-only.",
      "Judge0 is now the default hosted runner for this app, or you can set VITE_PISTON_API_URL to your own Piston instance.",
    ].join(" ");
  }

  return apiMessage || `HTTP error! status: ${response.status}`;
}

async function getResponseMessage(response) {
  let apiMessage = "";

  try {
    const data = await response.json();
    apiMessage = data?.message || "";
  } catch {
    apiMessage = "";
  }

  return apiMessage;
}

function getFileExtension(language) {
  const extensions = {
    javascript: "js",
    python: "py",
    java: "java",
  };

  return extensions[language] || "txt";
}
