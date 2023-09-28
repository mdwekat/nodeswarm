> :warning: **Warning:** This is an experimental package and may undergo significant changes. Please use with caution and feel free to report any issues or suggestions.


# ThreadIt

> Efficiently manage and utilize worker threads in Node.js.

ThreadIt is a lightweight, easy-to-use library designed to simplify the process of creating, managing, and utilizing
worker threads in Node.js, enabling developers to easily leverage multi-core processing power for CPU-bound tasks.

### Motivation and Features
`ThreadIt` was conceived out of a desire to simplify multithreading in Node.js, especially for TypeScript users. While Node.js offers the `worker_threads` module, it often requires dealing with separate JavaScript files and considerable boilerplate, shifting focus away from core application logic.

`ThreadIt` stands out by allowing developers to directly execute any function in the codebase using threads, eliminating the need for separate files and reducing boilerplate. This is particularly advantageous for those using TypeScript, providing a seamless and more focused development experience. This library facilitates intelligent and efficient multithreading, enabling easy integration and optimal utilization of system resources, all while maintaining a simple and user-friendly API.


## Features

- **Efficient Multithreading:**
  ThreadIt enables developers to easily create thread pools and dispatch tasks to worker threads, leveraging multi-core processing power for CPU-bound tasks, thus optimizing for performance and scalability.

- **Virtual Threads:**
  ThreadIt provides intelligent management of worker threads through its support for virtual threads, allowing users not to worry about manually managing the number of threads. It automatically handles the allocation and deallocation of threads, ensuring optimal performance and resource utilization.

- **Simple and Intuitive API:**
  ThreadIt offers a straightforward and easy-to-use API, making it simple to integrate and utilize in your projects, for creating thread pools and running tasks with minimal hassle.

- **Graceful Error Handling:**
  The library ensures graceful and informative handling of errors and thread termination, making debugging and resolving issues a breeze.

- **Flexible Configuration:**
  Adjustable pool sizes and various configurable options allow for fine-tuning to suit different needs and scenarios, providing flexibility in its integration.


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

`ThreadIt` operates within the boundaries of JavaScript and the Node.js runtime environment, and it’s important for users to be aware of the following limitations:

1. **Independent Execution Contexts:**
   Each thread runs in its own execution context, performing operations independently. This means that while `ThreadIt` enables parallel execution of code, operations within each separate execution context are single-threaded.

2. **Data Sharing Between Threads:**
   Currently, data shared between threads is copied rather than shared, meaning any modification made to the data in the worker thread doesn’t reflect in the main thread or other worker threads. However, we are actively working to support `SharedArrayBuffer` for sharing memory between threads in future releases.

3. **Optimized for CPU-bound Tasks:**
   `ThreadIt` is most advantageous for CPU-bound tasks. For I/O-bound tasks, using Node.js’s asynchronous, non-blocking I/O in the event-driven model is usually more efficient.

4. **Complexity and Overhead:**
   Introducing multithreading can bring additional complexity and overhead, and might be unnecessary for simple tasks or small-scale applications.

5. **Node.js Version Dependency:**
   `ThreadIt` requires a version of Node.js that supports the `worker_threads` module. This module is experimental in versions below 11.7.0 and is stable from Node.js 12 onwards.

6. **Experimental Status:**
   As `ThreadIt` is an experimental package, there might be unforeseen bugs or issues, and API stability is not guaranteed. Usage in production environments should be approached with caution.

Use `ThreadIt` wisely after considering the above limitations, and determining whether multithreading is the right solution for your specific needs.


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
