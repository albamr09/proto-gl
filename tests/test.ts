const green = "\x1b[32m";
const red = "\x1b[31m";
const reset = "\x1b[0m";
const checkmark = `${green}\u2714${reset}`; // ✓
const cross = `${red}\u2716${reset}`; // ✖

class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}

class Expectation<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  toBe(expected: T) {
    if (this.value !== expected) {
      throw new AssertionError(`Expected:\n${expected}\nGot:\n${this.value}`);
    }
  }

  toDeepEqual(expected: T) {
    if (JSON.stringify(this.value) !== JSON.stringify(expected)) {
      throw new AssertionError(`Expected:\n${JSON.stringify(expected)}\nGot:\n${JSON.stringify(this.value)}`);
    }
  }
}

type TestFn = () => void;

class TestSuite {
  name: string;
  tests: Array<{ name: string; fn: TestFn }>;

  constructor(name: string) {
    this.name = name;
    this.tests = [];
  }

  addTest(name: string, fn: TestFn) {
    this.tests.push({ name, fn });
  }

  run() {
    console.log(`Running Test Suite: ${this.name}`);
    this.tests.forEach(({ name, fn }) => {
      try {
        fn();
        console.log(`${checkmark} ${name}`);
      } catch (e) {
        if (e instanceof AssertionError) {
          console.error(`${cross} ${name}`);
          console.error(e.message);
        } else {
          console.error(`Could no execute test ${name}`);
          console.log(e);
        }
      }
    });
  }
}

let suite: TestSuite;

export function describe(name: string, fn: () => void) {
  suite = new TestSuite(name);
  fn();
  suite.run();
}

export function it(name: string, fn: TestFn) {
  suite.addTest(name, fn);
}

export function expect<T>(value: T): Expectation<T> {
  return new Expectation(value);
}
