const InternalServerError = (traceback: String, field?: String) => {
  return {
    error: {
      field,
      traceback,
      message: "INTERNAL_SERVER_ERROR",
      humanMessage: "Something went wrong. Please try again later.",
    },
  };
};

const UserNotFound = (traceback: String, field?: String) => {
  return {
    error: {
      field,
      traceback,
      message: "USER_NOT_FOUND",
      humanMessage: "User not found.",
    },
  };
};

const MissingFields = (traceback: String, field?: String) => {
  return {
    error: {
      field,
      traceback,
      message: "MISSING_FIELDS",
      humanMessage: "Please provide all required fields.",
    },
  };
};

export default { InternalServerError, UserNotFound, MissingFields };
