'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    let result = [];
    let beginnedJobsCount = 0;
    let finishedJobsCount = 0;

    return new Promise(resolve => {
        if (jobs.length === 0) {
            resolve(result);
        }
        while (beginnedJobsCount < parallelNum) {
            beginJob(beginnedJobsCount++, resolve);
        }
    });

    function getJobWithTimeout(jobNumber) {
        return new Promise((timedResolve, timedReject) => {
            jobs[jobNumber]()
                .then(timedResolve, timedReject);
            setTimeout(() => timedReject(new Error('Promise timeout')), timeout);
        });
    }

    function beginJob(jobNumber, resolve) {
        const onFulfilledRejected = jobResult => finishJob(jobResult, jobNumber, resolve);
        getJobWithTimeout(jobNumber)
            .then(onFulfilledRejected)
            .catch(onFulfilledRejected);
    }

    function finishJob(jobResult, jobNumber, resolve) {
        result[jobNumber] = jobResult;
        finishedJobsCount++;
        if (finishedJobsCount === jobs.length) {
            resolve(result);
        }
        if (beginnedJobsCount < jobs.length) {
            beginJob(beginnedJobsCount++, resolve);
        }
    }
}
