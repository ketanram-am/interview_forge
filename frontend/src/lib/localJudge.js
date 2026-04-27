const LOCAL_JAVASCRIPT_JUDGES = {
  "two-sum": {
    functionName: "twoSum",
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
    ],
    run(solution, args) {
      return solution(...args);
    },
  },
  "reverse-string": {
    functionName: "reverseString",
    tests: [
      { args: [["h", "e", "l", "l", "o"]], expected: ["o", "l", "l", "e", "h"] },
      { args: [["H", "a", "n", "n", "a", "h"]], expected: ["h", "a", "n", "n", "a", "H"] },
    ],
    run(solution, args) {
      const [characters] = args;
      solution(characters);
      return characters;
    },
  },
  "valid-palindrome": {
    functionName: "isPalindrome",
    tests: [
      { args: ["A man, a plan, a canal: Panama"], expected: true },
      { args: ["race a car"], expected: false },
      { args: [" "], expected: true },
    ],
    run(solution, args) {
      return solution(...args);
    },
  },
  "maximum-subarray": {
    functionName: "maxSubArray",
    tests: [
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { args: [[1]], expected: 1 },
      { args: [[5, 4, -1, 7, 8]], expected: 23 },
    ],
    run(solution, args) {
      return solution(...args);
    },
  },
  "container-with-most-water": {
    functionName: "maxArea",
    tests: [
      { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { args: [[1, 1]], expected: 1 },
    ],
    run(solution, args) {
      return solution(...args);
    },
  },
};

export function runLocalJavascriptJudge(problemId, code) {
  const judge = LOCAL_JAVASCRIPT_JUDGES[problemId];

  if (!judge) {
    return null;
  }

  try {
    const solution = loadSolutionFunction(code, judge.functionName);

    if (typeof solution !== "function") {
      return {
        success: false,
        error: `Couldn't find a \`${judge.functionName}\` function in your code.`,
      };
    }

    const outputs = [];

    for (const [index, test] of judge.tests.entries()) {
      const args = cloneValue(test.args);
      const actual = judge.run(solution, args);

      outputs.push(serializeValue(actual));

      if (!isEqual(actual, test.expected)) {
        return {
          success: false,
          output: outputs.join("\n"),
          error: `Test ${index + 1} failed. Expected ${serializeValue(test.expected)}, got ${serializeValue(actual)}.`,
        };
      }
    }

    return {
      success: true,
      output: outputs.join("\n"),
    };
  } catch (error) {
    return {
      success: false,
      error: `Code execution failed: ${error.message}`,
    };
  }
}

function loadSolutionFunction(code, functionName) {
  const evaluator = new Function(`
    "use strict";
    const window = undefined;
    const document = undefined;
    const fetch = undefined;
    const XMLHttpRequest = undefined;
    const localStorage = undefined;
    const sessionStorage = undefined;
    const alert = undefined;
    const prompt = undefined;
    const confirm = undefined;
    const console = { log() {}, error() {}, warn() {}, info() {} };

    ${code}

    return typeof ${functionName} !== "undefined" ? ${functionName} : null;
  `);

  return evaluator();
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function isEqual(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function serializeValue(value) {
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  if (typeof value === "string") {
    return value;
  }

  return String(value);
}
