import Sval from "sval"

const SvalConstructor: typeof Sval =
  (Sval as any)?.default ||
  Sval ||
  (typeof require === "function" ? require("sval") : undefined)

if (typeof globalThis !== "undefined") {
  ;(globalThis as any).__sval = SvalConstructor
}

export function createInterpretedFunction(
  ...argsAndCode: string[]
): (...args: any[]) => any {
  const sourceCode = argsAndCode[argsAndCode.length - 1]
  const argNames = argsAndCode.slice(0, -1)
  const params = argNames.join(", ")

  const interpreter = new SvalConstructor({
    ecmaVer: "latest",
    sandBox: false,
  })

  interpreter.run(`
    exports.makeFunction = function(${params}) {
      ${sourceCode}
    };
  `)

  return interpreter.exports.makeFunction
}