export const createUser = async (userDB, user) => {
    const userId = `user-${Date.now()}`;
    await userDB.put(userId, user);
    return userId;
  };
  
  export const listUsers = async (userDB) => {
    const stream = userDB.createReadStream();
    const users = [];
    for await (const { key, value } of stream) {
      users.push({ id: key, ...value });
    }
    return users;
  };
  