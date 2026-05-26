const User = require('../../modules/users/user.model');

class UserRepository {
  async findByEmail(email) { return await User.findOne({ email }); }
  async save(userData) { return await new User(userData).save(); }
  async findById(id) { return await User.findById(id).select('-password'); }
  async find(query) { return await User.find(query).select('-password -__v'); }
  async update(id, updates) { return await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password -__v'); }
  async delete(id) { return await User.findByIdAndDelete(id); }
  async findByIdWithPassword(id) { return await User.findById(id); }
}
module.exports = new UserRepository();
