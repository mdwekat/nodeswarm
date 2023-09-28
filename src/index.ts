import {ThreadPool} from './ThreadPool';

async function main() {
    console.log('Starting...');

    const pool = new ThreadPool();

    // number of threads to use, defaults to the number of CPUs
    console.log('Pool size:', pool.size);


    try {
        const result = await pool.thread((a: number, b: number) => a + b, 2, 3);
        console.log('Result:', result); // should log 5


        // console.time('fib block');
        // const promises1 = Array(10).fill(0).map((_, i) => fib(40));
        // await Promise.all(promises1);
        // console.timeEnd('fib block');

        // now with threads

        console.time('fib thread');
        const promises2 = Array(10).fill(0).map((_, i) => pool.thread(fib, 40));
        await Promise.all(promises2);
        console.timeEnd('fib thread');

        // block the thread for one second
        // console.time('block');
        // const promises3 = Array(10).fill(0).map((_, i) => blockThreadForOneSecond());
        // await Promise.all(promises3);
        // console.timeEnd('block');

        // now with threads

        console.time('thread');
        const promises4 = Array(10).fill(0).map((_, i) => pool.thread(blockThreadForOneSecond));
        await Promise.all(promises4);
        console.timeEnd('thread');

        // test closing

        console.time('closing');
        const promises5 = Array(10).fill(0).map((_, i) => pool.thread(blockThreadForOneSecond));
        pool.close();

        pool.thread(blockThreadForOneSecond).catch(() => console.error('Error: Thread pool is closed'));

        console.log('Waiting for jobs to finish...');

        await Promise.all(promises5);
        console.timeEnd('closing');



    } catch (error) {
        console.error('Error:', error);
        pool.terminate();
    } finally {
        console.log('Done.');
    }
}

main();


function fib(n: number): number {
    return n <= 1 ? n : fib(n - 1) + fib(n - 2);
}

function blockThreadForOneSecond() {
    const startTime = Date.now(); // Get the current time in milliseconds
    while (Date.now() - startTime < 1000) {
    }; // Block the thread until 1 second has passed
}