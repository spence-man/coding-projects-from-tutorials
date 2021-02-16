// prop === 'email' or 'password' etc
// errors.mapped() converts the array of error messages, to objects with each key as
// a param
// { email: { msg: 'Invalid Email' }, password: {}, etc}

module.exports = {
  getError(errors, prop) {
    try {
      return errors.mapped()[prop].msg;
    } catch (err) {
      return "";
    }
  },
};
