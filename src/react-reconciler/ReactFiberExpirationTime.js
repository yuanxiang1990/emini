const HIGH_PRIORITY_EXPIRATION = 500;
const HIGH_PRIORITY_BATCH_SIZE = 100;
const NoWork = 0;
const Never = 1;
const originalStartTimeMs = Date.now();
const maxSigned31BitInt = 1073741823;
const Sync = maxSigned31BitInt;
const noTimeout = -1;
const MAGIC_NUMBER_OFFSET = maxSigned31BitInt - 1;
const UNIT_SIZE = 10;


// 1 unit of expiration time represents 10ms.
function msToExpirationTime(ms) {
    // Always add an offset so that we don't clash with the magic number for NoWork.
    return MAGIC_NUMBER_OFFSET - (ms / UNIT_SIZE | 0);
}


function computeInteractiveExpiration(currentTime) {
    return computeExpirationBucket(currentTime, HIGH_PRIORITY_EXPIRATION, HIGH_PRIORITY_BATCH_SIZE);
}

const LOW_PRIORITY_EXPIRATION = 5000;
const LOW_PRIORITY_BATCH_SIZE = 250;

function computeAsyncExpiration(currentTime) {
    return computeExpirationBucket(currentTime, LOW_PRIORITY_EXPIRATION, LOW_PRIORITY_BATCH_SIZE);
}

function computeExpirationBucket(currentTime, expirationInMs, bucketSizeMs) {
    return MAGIC_NUMBER_OFFSET - ceiling(MAGIC_NUMBER_OFFSET - currentTime + expirationInMs / UNIT_SIZE, bucketSizeMs / UNIT_SIZE);
}

/**
 * 取整操作
 * @param num
 * @param precision
 * @returns {number}
 */
function ceiling(num, precision) {
    return ((num / precision | 0) + 1) * precision;
}

export {
    NoWork,
    Never,
    Sync,
    noTimeout,
    maxSigned31BitInt,
    originalStartTimeMs,
    msToExpirationTime,
    MAGIC_NUMBER_OFFSET,
    UNIT_SIZE,
    computeInteractiveExpiration,
    computeAsyncExpiration
}