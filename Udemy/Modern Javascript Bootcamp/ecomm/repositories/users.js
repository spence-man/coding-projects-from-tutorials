const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);

class UsersRepository {
  constructor(filename) {
    if (!filename) {
      throw new Error("Creating a repository requires a filename");
    }

    this.filename = filename;

    // The fs.accessSync() method is used to synchronously test the permissions of a given file or directory.
    // not allowed to have async code in constructor
    try {
      fs.accessSync(this.filename);
    } catch (err) {
      fs.writeFileSync(this.filename, "[]");
    }
  }

  // Open the file
  // read its contents
  // parse the contents
  // return the parsed data
  async getAll() {
    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding: "utf8",
      })
    );
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

  // Saved -> password saved in our database 'hashed.salt'
  // Supplied -> password given to us by a user trying to sign in
  async comparePasswords(saved, supplied) {
    const [hashed, salt] = saved.split(".");
    const hashSuppliedBuf = await scrypt(supplied, salt, 64);

    return hashed === hashSuppliedBuf.toString("hex");
  }

  // write the updated 'records' array back to the file
  async writeAll(records) {
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(records, null, 2)
    );
  }

  randomId() {
    return crypto.randomBytes(4).toString("hex");
  }

  async getOne(id) {
    const records = await this.getAll();
    return records.find((record) => record.id === id);
  }

  async delete(id) {
    const records = await this.getAll();
    const filteredRecords = records.filter((record) => record.id !== id);
    await this.writeAll(filteredRecords);
  }

  async update(id, attrs) {
    const records = await this.getAll();
    const record = records.find((record) => record.id === id);

    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }

    /**

    Object.assign mutates the first argument passed to it.
    In other words, we are making changes to the 'record' object - we are not creating a new one.
    The key thing to keep in mind here is that there is only one 'record' object in memory.
    We can access it by pulling it out of the array or referring to the 'record' variable.  At all times, it is the same object in memory.
    So if we change the 'record' variable, it is identical to changing the object through the array as well.

    */

    // record === { email: "test@test.com" };
    // attrs === { password: "mypassword" };
    Object.assign(record, attrs);
    // record === { email: "test@test.com", password: "mypassword" };

    await this.writeAll(records);
  }

  async getOneBy(filters) {
    const records = await this.getAll();
    for (let record of records) {
      let found = true;

      for (let key in filters) {
        if (record[key] !== filters[key]) {
          found = false;
        }
      }

      if (found) {
        return record;
      }
    }
  }
}

module.exports = new UsersRepository("users.json");
