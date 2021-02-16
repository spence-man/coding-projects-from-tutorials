const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const Repository = require("./repository");
const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
  // Saved -> password saved in our database 'hashed.salt'
  // Supplied -> password given to us by a user trying to sign in
  async comparePasswords(saved, supplied) {
    const [hashed, salt] = saved.split(".");
    const hashSuppliedBuf = await scrypt(supplied, salt, 64);

    return hashed === hashSuppliedBuf.toString("hex");
  }

  // { email: 'abc@def.com', password: 'adfd' }
  async create(attrs) {
    attrs.id = this.randomId();
    const salt = crypto.randomBytes(8).toString("hex");

    // original password is hashed with a random salt
    // ex: mypassword+salt === aGVsbG8gd29ybGQ
    // scrypt returns a buffer
    const buf = await scrypt(attrs.password, salt, 64);

    const records = await this.getAll();
    // destructing here will replace the original password with our hashed password
    const record = {
      ...attrs,
      password: `${buf.toString("hex")}.${salt}`,
    };
    records.push(record);

    await this.writeAll(records);

    return record;
  }
}

module.exports = new UsersRepository("users.json");
