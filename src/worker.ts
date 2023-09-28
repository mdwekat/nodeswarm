import { WorkerMessage } from 'ThreadPool';
import { parentPort } from 'worker_threads';

parentPort.on('message', async (message: WorkerMessage) => {
    let result, error;
    try {
        const fn = new Function('return ' + message.fn)();
        result = await Promise.resolve(fn(...message.args)); // ensure it's resolved
    } catch (e) {
        error = e.message;
    }
    parentPort.postMessage({ result, error });
});
