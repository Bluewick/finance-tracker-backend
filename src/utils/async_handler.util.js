export const async_handler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const asyncHandler = async_handler;
export default async_handler;

