import os from "os";
import { resolve } from "path";
import { Worker } from "worker_threads";

/**
 * Represents the configuration options for the thread pool.
 */
export interface ThreadPoolConfig {
  poolSize?: number;
}

/**
 * Represents a job to be executed in the thread pool.
 */
export interface Job<R> {
  fn: (...args: any[]) => R;
  args: any[];
  resolve: (value: R | PromiseLike<R>) => void;
  reject: (reason?: any) => void;
}

/**
 * Represents a message between the main thread and worker threads.
 */
export interface WorkerMessage {
  fn: string;
  args: any[];
  result?: any;
  error?: string;
}

/**
 * ThreadPool class manages a pool of worker threads and schedules jobs
 * to be executed in the threads.
 */
export class ThreadPool {
  private workers: Worker[] = [];
  private queue: Job<any>[] = [];
  private workerJobMap = new Map<Worker, Job<any>>();
  private closing: boolean = false;

  private static readonly workerPath = resolve(__dirname, "./worker.js");
  private readonly poolSize: number;

  /**
   * Constructor initializes the ThreadPool with a specified number
   * of workers or defaults to the number of CPU cores.
   *
   * @param poolSize - Number of threads in the pool.
   */
  constructor(config?: ThreadPoolConfig) {
    this.poolSize = config?.poolSize || os.cpus().length;
    this.initializeWorkers();
  }

  /**
   * Returns the size of the thread pool.
   */
  get size() {
    return this.poolSize;
  }

  /**
   * Creates and initializes worker threads in the pool.
   */
  private initializeWorkers() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(ThreadPool.workerPath);
      worker.on("message", (message) => this.onMessage(worker, message));
      worker.on("error", (error) => this.onError(worker, error));
      this.workers.push(worker);
    }
  }

  /**
   * Executes the specified function in a worker thread.
   *
   * @param fn - The function to execute.
   * @param args - The arguments to pass to the function.
   * @returns A promise that resolves with the result of the function.
   */
  thread<R>(fn: (...args: any[]) => R, ...args: any[]): Promise<R> {
    return new Promise((resolve, reject) => {
      if (this.closing) {
        return reject(new Error("Cannot accept new jobs while closing"));
      }
      const job: Job<R> = { fn, args, resolve, reject };
      this.enqueue(job);
    });
  }

  /**
   * Enqueues the job or runs it immediately if a worker is available.
   *
   * @param job - The job to enqueue.
   */
  private enqueue(job: Job<any>) {
    const availableWorker = this.workers.find(
      (worker) => !this.workerJobMap.has(worker),
    );
    if (availableWorker) {
      this.runJob(availableWorker, job);
    } else {
      this.queue.push(job);
    }
  }

  /**
   * Sends the job to a worker for execution.
   *
   * @param worker - The worker to run the job.
   * @param job - The job to run.
   */
  private runJob(worker: Worker, job: Job<any>) {
    this.workerJobMap.set(worker, job);
    const message: WorkerMessage = { fn: job.fn.toString(), args: job.args };
    worker.postMessage(message);
  }

  /**
   * Handles messages received from worker threads.
   *
   * @param worker - The worker that sent the message.
   * @param message - The received message.
   */
  private onMessage(worker: Worker, message: WorkerMessage) {
    const job = this.workerJobMap.get(worker);
    if (!job) return;
    message.error
      ? job.reject(new Error(message.error))
      : job.resolve(message.result);
    this.workerJobMap.delete(worker);
    if (this.queue.length > 0) {
      this.runJob(worker, this.queue.shift()!);
    }
  }

  /**
   * Handles errors received from worker threads.
   *
   * @param worker - The worker that experienced the error.
   * @param error - The error received.
   */
  private onError(worker: Worker, error: any) {
    this.workerJobMap.get(worker)?.reject(error);
    this.workerJobMap.delete(worker);
  }

  /**
   * Gracefully closes all worker threads after completing all ongoing jobs.
   */
  async close() {
    this.closing = true;
    while (this.queue.length > 0 || this.workerJobMap.size > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    this.terminate();
  }

  /**
   * Immediately terminates all worker threads.
   */
  terminate() {
    this.workers.forEach((worker) => worker.terminate());
  }
}
