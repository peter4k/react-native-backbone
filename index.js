var RestKit = {}

RestKit.send = function(url, req, callback){
    var error = [];
    if(!req.method) error.push("Method not defined");
    if(error.length > 0) return callback(error, null);

    fetch(url, req)
    .then((response) => {
        if(response.status != 200){
            var error = {};
            error.status = response.status;
            error.statusText = response.statusText;
            return callback(error, null);
        }
        return response.json();
    })
    .then((json) => {
        callback(null, json);
    })
    .catch(function(error) {
        callback(error, null);
    });
}

module.exports = RestKit;
