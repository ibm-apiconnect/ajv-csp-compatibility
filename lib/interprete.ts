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

  const makeFunction = interpreter.exports.makeFunction

  const wrappedMakeFunction = function(...args: any[]) {
    const result = makeFunction(...args)
    if (typeof result === "function") {
      const returnFnIdx = sourceCode.indexOf("return function")
      let fnSource = sourceCode
      if (returnFnIdx !== -1) {
        fnSource = sourceCode.substring(returnFnIdx + "return ".length)
      }
      Object.defineProperty(result, "toString", {
        value: () => fnSource,
        configurable: true,
        writable: true
      })
    }
    return result
  }

  Object.defineProperty(wrappedMakeFunction, "toString", {
    value: () => `function(${params}) {\n${sourceCode}\n}`,
    configurable: true,
    writable: true
  })

  return wrappedMakeFunction
}