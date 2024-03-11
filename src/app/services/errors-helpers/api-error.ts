class ApiError extends Error {

  public override message: string;
  public methodName: string;
  public errorDetails: unknown;
  public errorType: string;

  constructor(msg: string, methodName: string, errorDetails: unknown, errorType: string) {
    super(msg);
    this.message = msg;
    this.methodName = methodName;
    this.errorDetails = errorDetails;
    this.errorType = errorType;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  getFormattedMessage() {
    return "Lo sentimos, ha ocurrido un error";
  }
}

export default ApiError;
