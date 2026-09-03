export function validate(schema) {
  return function (req, res, next) {
    const result = schema.safeParse({
      body: req.body ?? {},
      params: req.params ?? {},
      query: req.query ?? {}
    });

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    req.body = result.data.body;

    Object.assign(
      req.params,
      result.data.params
    );

    req.validated = result.data;

    next();
  };
}