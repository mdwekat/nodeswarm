import os from "os";
import path from "path";
import { Worker } from "worker_threads";

const actualPathResolve = path.resolve;

jest.mock("path", () => ({
  ...jest.requireActual("path"),
  resolve: (...args) => {
    // if the last arg is './worker.js', replace the resolved path
    if (args[args.length - 1] === "./worker.js") {
      return path.join(__dirname, "../test_tmp/worker.js");
    }
    // otherwise, call the original resolve function
    return actualPathResolve(...args);
  },
}));

// must be imported after the mock
import { ThreadPool } from "../src";

describe("ThreadPool", () => {
  let pool: ThreadPool;

  beforeEach(() => {
    pool = new ThreadPool();
  });

  afterEach(async () => {
    await pool.close();
  });

  test("should create thread pool with default size", () => {
    expect(pool.size).toBe(require("os").cpus().length);
  });

  test("should execute a job and return the result", async () => {
    const result = await pool.thread((a: number, b: number) => a + b, 2, 3);
    expect(result).toBe(5);
  });

  test("should execute 10 blockThreadForOneSecond jobs concurrently", async () => {
    const arrayLen = os.cpus().length;
    const start = Date.now();
    const promises = Array(arrayLen)
      .fill(0)
      .map((_, i) => pool.thread(blockThreadForOneSecond));
    await Promise.all(promises);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1500); // adjust as needed based on your expectations
  });

  it("should not accept new jobs while closing", async () => {
    await pool.close();
    await expect(pool.thread(() => {})).rejects.toThrow(
      "Cannot accept new jobs while closing",
    );
  });

  it("should handle errors correctly", async () => {
    await expect(
      pool.thread(() => {
        throw new Error("error");
      }),
    ).rejects.toThrow("error");
  });

  it("should terminate all workers immediately", async () => {
    const pool = new ThreadPool();
    const spy = jest.spyOn(Worker.prototype, "terminate");
    pool.terminate();
    expect(spy).toHaveBeenCalledTimes(pool.size);
  });

  it("should close all workers gracefully after completing ongoing jobs", async () => {
    const pool = new ThreadPool({ poolSize: 1 }); // One worker for simplicity
    const result = pool.thread(
      () => new Promise((resolve) => setTimeout(() => resolve("done"), 100)),
    );
    await pool.close();
    await expect(result).resolves.toBe("done");
  });

  it("should execute multiple jobs concurrently", async () => {
    const results = await Promise.all([
      pool.thread((a, b) => a + b, 1, 2),
      pool.thread((a, b) => a * b, 2, 3),
    ]);
    expect(results).toEqual([3, 6]);
  });

  it("should handle high load properly", async () => {
    const jobs = Array(1000).fill(() => pool.thread(() => 1 + 1));
    await expect(Promise.all(jobs)).resolves.not.toThrow();
  });
});

function blockThreadForOneSecond() {
  const startTime = Date.now();
  while (Date.now() - startTime < 1000) {}
}

function fib(n: number): number {
  return n <= 1 ? n : fib(n - 1) + fib(n - 2);
}
