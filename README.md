# React-native-rest-kit

As react native does not support Node.js HTTP module, I create this simple experiemental rest kit using the built in "fetch" method.
* (In progress, not supported) The purpose of this kit is to build a backbone-like model structure. So that you can simply call "save", "update", "fetch" method on each model.
* Add an extra layer of the fetch method to check if the status API returns is not 200.
* Returns an json file instead of response object

to use this kit:
```
RestKit.send('URL', REQUEST-OBJECT, function(error, json){
                if(error)
                    console.log("encoutered error: ", error);
                console.log(json);
            });
```

* REQUEST-OBJECT: the same object used for fetch()
