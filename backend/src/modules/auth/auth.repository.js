const User = require('../../modules/users/user.model');

class AuthRepository {
  async findUserByEmailWithPassword(email) {
    return await User.findOne({ email }).select('+password');
  }
}

module.exports = new AuthRepository();
