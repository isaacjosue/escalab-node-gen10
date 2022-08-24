const { UserModel } = require("../models");

/**
 * @param {Object} user
 * @param {String} user.id
 * @param {String} user.name
 * @param {String} user.lastName
 * @param {String} user.email
 * @returns saved user
 */
const saveUser = async (user) => {
  const savedUser = new UserModel(user);

  await savedUser.save();

  return savedUser;
};

/**
 * @param {String} id
 * @returns found user
 */
const getOneUser = async (id) => {
  const users = await UserModel.find({ id }).populate("articleId");

  return users[0];
};

/**
 * @returns found users
 */
const getAllUsers = async () => {
  const users = await UserModel.find();

  return users;
};

/**
 * @param {String} id
 * @returns found user
 */
const removeOneUser = async (id) => {
  const user = await UserModel.findOneAndRemove({ id });

  return user;
};

/**
 * @param {Object} user
 * @param {String} user.id
 * @param {String|undefined} user.name
 * @param {String|undefined} user.lastName
 * @param {String|undefined} user.email
 * @param {ObjectId} user.articleId
 * @returns updated user
 */
const updateOneUser = async (user) => {
  const { id, name, lastName, email, articleId } = user;
  const userUpdated = await UserModel.findOneAndUpdate(
    { id },
    { name, lastName, email, articleId },
    { new: true }
  ).populate("articleId");

  return userUpdated;
};

module.exports = {
  saveUser,
  getOneUser,
  getAllUsers,
  removeOneUser,
  updateOneUser,
};
