/**
 * Create Event
 * POST /event/create
 * @param params
 * @returns {Promise}
 */
Connection.createEvent = function(params) {
    return Connection
        .post('/event', params)
        .then(function(res) {
            res.result = EventModel(res.result);
            return res;
        })
        .catch(function(e) {
            console.error(e);
        });
};

/**
 * Delete Event
 * DELETE /event/:id
 * @param {string} id
 * @returns {Promise}
 */
Connection.deleteEvent = function(id) {
    return Connection
        .delete('/event/' + id)
        .then(function(res) {
            res.result = EventModel(res.result);
            return res;
        })
        .catch(function(e) {
            console.error(e);
        });
};

/**
 * Get All Event
 * GET /event/all
 * @returns {Promise}
 */
Connection.getAllEvents = function() {
    return Connection
        .get('/event/all')
        .then(function(res) {
            res.result = res.result.map(EventModel);
            return res;
        })
        .catch(function(e) {
            console.error(e);
        });
};
