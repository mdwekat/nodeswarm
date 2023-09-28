> :warning: **Warning:** This is an experimental package and may undergo significant changes. Please use with caution and feel free to report any issues or suggestions.

# ThreadIt

[![npm version](https://badge.fury.io/js/threadit.svg)](https://badge.fury.io/js/threadit)
[![Known Vulnerabilities](https://snyk.io/test/github/omrilotan/threadit/badge.svg?targetFile=package.json)](https://snyk.io/test/github/omrilotan/threadit?targetFile=package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Efficiently manage and utilize worker threads in Node.js.

ThreadIt is a lightweight, easy-to-use library designed to simplify the process of creating, managing, and utilizing
worker threads in Node.js, enabling developers to easily leverage multi-core processing power for CPU-bound tasks.

### Motivation and Features
`ThreadIt` was developed to simplify multithreading in Node.js, reducing the hassle and distraction from extensive boilerplate required by `worker_threads`. The library enables direct execution of any function using threads, removing the need for separate files, especially beneficial for TypeScript users, all within a clean and intuitive API.

## Features
- **Efficiency:** Offers optimal performance and scalability through simplified multithreading and efficient management of CPU-bound tasks.
- **Virtual Threads & Queue:** Ensures orderly and resource-efficient task execution.
- **Simple API:** Guarantees easy integration and straightforward task execution.
- **Error Handling:** Facilitates smooth debugging with concise error feedback.
- **Flexibility:** Provides adjustable configurations to suit various needs.

## Installation
Install ThreadIt using npm:

```shell
npm install threadit
```

Or with yarn:

```shell
yarn add threadit
```

## Quick Start
Here's a simple example of how to use ThreadIt to run a task in a separate thread:

```typescript
const { ThreadPool } = require('threadit');

const pool = new ThreadPool();

async function main() {
  try {
    const result = await pool.thread((a, b) => a + b, 2, 3);
    console.log(result); // Outputs: 5
  } catch (error) {
    console.error(error);
  } finally {
    await pool.close();
  }
}

main();
```

## Fibonacci Example

Let's use the famous Fibonacci function to compare running tasks with normal Promises and with the ThreadIt ThreadPool. Fibonacci is a CPU-bound task which makes it a good candidate to showcase the benefits of multithreading.

```typescript
// Import your thread pool
import { ThreadPool } from 'threadit'; // Adjust the import path as necessary

const pool = new ThreadPool();

// Define a fib function
function fib(n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}

// Run fib normally
console.time('fib block');
const promises1 = Array(10).fill(0).map((_, i) => fib(40));
await Promise.all(promises1);
console.timeEnd('fib block');

// Run fib with threads
console.time('fib thread');
const promises2 = Array(10).fill(0).map((_, i) => pool.thread(fib, 40));
await Promise.all(promises2);
console.timeEnd('fib thread');

```

## Limitations

`ThreadIt` offers a streamlined approach to multithreading in Node.js but has its constraints:

1. **Independent Execution:** Threads run separately, and despite parallel execution, each context remains single-threaded.
2. **Data Sharing:** Data between threads is copied, not shared. `SharedArrayBuffer` support is planned for the future.
3. **Optimized for CPU-bound Tasks:** For I/O-bound tasks, Node.js’s asynchronous I/O is typically more efficient.
4. **Overhead:** Multithreading introduces added complexity and might be excessive for simple applications.
5. **Node.js Dependency:** Requires Node.js supporting `worker_threads` (experimental pre-11.7.0, stable from v12).
6. **Incompatibility with Classes:** The library may not handle classes as expected.
7. **Experimental Status:** Potential for bugs or API changes. Use cautiously in production.

Ensure `ThreadIt` aligns with your requirements before integrating it into projects.


## Security Consideration: Use of Eval

`ThreadIt` utilizes `eval()` internally to dynamically execute functions in worker threads. While this offers flexibility and ease of use, it also necessitates caution:

- **Do not use `ThreadIt` to run untrusted or user-provided code.** Doing so can expose your application to significant security risks, including arbitrary code execution.
- **Use exclusively with your own, well-reviewed code.** Ensure that the code being run with `ThreadIt` is secure and has been thoroughly reviewed to avoid potential security vulnerabilities.

By adhering strictly to these guidelines, you can mitigate risks associated with the use of `eval()` and safely enjoy the benefits of `ThreadIt`.


## API
### ThreadPool
`new ThreadPool([config])`

Creates a new thread pool. Optionally, you can provide a config object to specify the pool size.

`thread(fn: Function, ...args: any[]): Promise<any>`

Executes the provided function fn in a separate thread with the provided arguments args and returns a promise that resolves with the result.

`close(): Promise<void>`

Gracefully closes all worker threads after completing all ongoing jobs.

`terminate(): void`

Immediately terminates all worker threads.

## License
ThreadIt is MIT licensed.
