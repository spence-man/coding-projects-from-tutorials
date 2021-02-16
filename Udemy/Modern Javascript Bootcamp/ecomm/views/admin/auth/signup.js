const layout = require("../layout");

const getError = (errors, prop) => {
  // prop === 'email' or 'password' etc
  // errors.mapped() converts the array of error messages, to objects with each key as
  // a param
  // { email: { msg: 'Invalid Email' }, password: {}, etc}
  try {
    return errors.mapped()[prop].msg;
  } catch (err) {
    return "";
  }
};

module.exports = ({ req, errors }) => {
  return layout({
    content: `
    <div>
      Your id is: ${req.session.userId}
      <form method="POST">
        <input name="email" placeholder="email" />
        ${getError(errors, "email")}
        <input name="password" placeholder="password" />
        ${getError(errors, "password")}
        <input name="passwordConfirmation" placeholder="password confirmation" />
        ${getError(errors, "passwordConfirmation")}
        <button>Sign Up</button>
      </form>
    </div>
    `,
  });
};
