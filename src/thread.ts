import { Worker } from 'worker_threads';
import * as path from 'path';

export function thread<R>(fn: (...args: any[]) => R, ...args: any[]): Promise<R> {
    const workerPath = path.resolve(__dirname, './worker.js'); // Adjust the path accordingly to point to the compiled worker.js file.
    const worker = new Worker(workerPath);

    return new Promise((resolve, reject) => {
        worker.postMessage({ fn: fn.toString(), args });

        worker.on('message', (result) => {
            if (result && result.error) {
                return reject(new Error(result.error));
            }
            resolve(result);
        });

        worker.on('error', (err) => {
            reject(err);
        });

        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}
