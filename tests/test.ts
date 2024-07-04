const green = "\x1b[32m";
const red = "\x1b[31m";
const reset = "\x1b[0m";
const checkmark = `${green}\u2714${reset}`; // ✓
const cross = `${red}\u2716${reset}`; // ✖

class Test {
  constructor() {}

  static assertEqual<T>(actual: T, expected: T, message: string) {
    const areEqual = JSON.stringify(actual) === JSON.stringify(expected);

    if (!areEqual) {
      console.error(`${cross} ${message} Failed\nExpected:\n ${JSON.stringify(expected)}\nGot:\n ${JSON.stringify(actual)}`);
    } else {
      console.log(`${checkmark} ${message} Passed`);
    }
  }
}

export default Test;

