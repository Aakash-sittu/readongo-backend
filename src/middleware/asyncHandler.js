/**
 * Wraps async functions to catch errors and pass them to the error handler.
 * @param {Function} fn - The async function to wrap.
 * @returns {Function} - The wrapped middleware.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
