/**
 * Create User
 * POST /user/create
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise}
 */
Connection.createUser = function(name, email, password) {
    return Connection
        .post('/user', {
            name: name,
            email: email,
            password: password
        })
        .then(function(response) {
            if (response.isSuccess) {
                return Connection.setToken(response.result).
                then(function() {
                    return response;
                })
            } else {
                return response;
            }
        })
        .catch(function(e) {
            console.error(e);
        });
};
