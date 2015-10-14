# React-native-rest-kit

As react native does not support Node.js HTTP module, I create this simple experiemental rest kit using the built in "fetch" method.
* (In progress, not supported) The purpose of this kit is to build a backbone-like model structure. So that you can simply call "save", "update", "fetch" method on each model.
* Add an extra layer of the fetch method to check if the status API returns is not 200.
* Returns an json file instead of response object

### Send simple HTTP request
This is based on the React Native fetch method. It has a simple error checking to check if the response status is not 200.
The returned object is a json instead of a response object

```
//Set up request object
var request = {
    method: 'post',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        "app":"FM Business",
        "platform":"iOS"
    })
}

var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA';

RestKit.send(url, request, function(error, json){
                if(error)
                    console.log("encoutered error: ", error);
                console.log(json);
            });
```

* request object: the same object used for fetch()

### RestKit.Model
RestKit.Model is brought from backbone. It is used almost the same as Backbone.Model, but only part of the functions are implemented. 
