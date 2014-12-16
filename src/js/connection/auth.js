Connection.status = function() {
    return Connection.getToken()
        .then(function(token) {
            if (!token) {
                return Promise.resolve(false);
            }

            return Connection
                .get('/auth/status', {
                    token: token
                })
                .then(function(response) {
                    if (!response.result) {
                        return Connection.setToken('')
                            .then(function() {
                                return response;
                            });
                    } else {
                        return response;
                    }
                })
                .catch(function(e) {
                    console.error(e);
                });
        });
};

Connection.login = function(email, password) {
    return Connection
        .post('/auth/login', {
            email: email,
            password: password
        })
        .then(function(response) {
            if (response.isSuccess) {
                return Connection.setToken(response.result)
                    .then(function() {
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
