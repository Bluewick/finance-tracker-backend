export const send_success = (
  res,
  {
    status_code = 200,
    message = "Resource processed successfully",
    data = null,
    meta = null,
  } = {}
) => {
  const payload = {
    success: true,
    message,
    data,
  };

  if (meta !== null && meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(status_code).json(payload);
};

export const send_error = (
  res,
  {
    status_code = 500,
    code = "INTERNAL_SERVER_ERROR",
    message = "Internal Server Error",
    details = [],
  } = {}
) => {
  return res.status(status_code).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};

export default {
  send_success,
  send_error,
};

