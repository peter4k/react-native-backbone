# React-native-rest-kit

As react native does not support Node.js HTTP module, I create this simple experiemental rest kit using the built in "fetch" method.
* The purpose of this kit is to build a backbone-like model structure. So that you can simply call "save", "update", "fetch" method on each model.
* Add an extra layer of the fetch method to check if the status API returns is not 200. Returns an json file instead of response object.

To do:
* Implement "collection"
* Implement event listeners

1. [Setup](https://github.com/peter4k/react-native-rest-kit#install)
2. [RestKit.Model](https://github.com/peter4k/react-native-rest-kit#restkitmodel)
3. [AsyncStorage](https://github.com/peter4k/react-native-rest-kit#local-storage)
4. [RestKit.send()](https://github.com/peter4k/react-native-rest-kit#restkitsend)

## Install
RestKit requires underscore.

The easiest way to install: `npm install react-native-rest-kit`

And require it in your React Native app: `var RestKit = require('react-native-rest-kit);`

## RestKit.Model
RestKit.Model is brought from backbone. It is used almost the same as Backbone.Model, but only part of the functions are implemented. 

#### Create a model class
```
var Car = RestKit.Model.extend({
	urlRoot = "http://www.your-domain.com/car"
	//More options to be added
});
```
rootUrl: the root url where this model connects to.
* value: `String` or `function`. If its a function it should return a string.

#### Create an instance
```
var car = new Car({
	"make": "BMW",
	"model": "428i",
	"year": 2014
})
```
You can create a model using the `new` keyword. You can pass an object as the initial value of the model, you can also create an empty model.

#### Model methods:
##### set():
```
people.set('mpg', '23')
```
this will set the atrribute mpg to 23.
* If the attribute does not exist, this attribute will be added to the model.
* If the attribute does exist, the value will be replaced.

You can also pass a json object as the argument:
```
people.set({
	"mpg": 23,
	"color": "white"
})
```

##### unset():
```
people.unset('mpg', '23')
```
The attribute "mpg" will be deleted
* Unset does not take json object or array as argument.

##### isNew():
```
people.isNew();
```
This will return ture if "id" attribute does not exist

##### save():
```
var option = {
	headers:{
		"Authentiacation":"Bearer SOME_TOKEN"
	}
}

people.save(option, function(error){
    if(error) console.log(error);
    console.log(people);
});
```
Save this model to the server, this is POST for new model and PUT for existing model
* option: (optional)
** option.headers: the headers to be added to the HTTP request

##### fetch():
```
people = new People({
	_id: 1
});

people.fetch(function(error){
    if(error) console.log(error);
    console.log(people);
});
```
Fetch this model from the server, this is GET request
* To fetch an model, ID has to be set.
* option: (optional)
** option.headers: the headers to be added to the HTTP request

##### delete():
```
people.delete(option, function(error){
    if(error) console.log(error);
});
```
Delete this model to the server, this is DELETE method
* To delete an model, ID has to be set.
* option: (optional)
** option.headers: the headers to be added to the HTTP request

#### RestKit.globalOption
##### RestKit.globalOption.headers
```
RestKit.globalOption.headers:{
	"Authentiacation":"Bearer SOME_TOKEN"
}
```
The headers to be included in every request.

## Local Storage
RestKit take advantage of AsycnStorage of React Native to allow you to store an instance of a model (or collection) to the local storage of your device, and conveniently retrieve it.

#### Model.saveToLocalStorage(unique_key, callback)
```
var car = new Car({"make":"bmw"});
car.saveToLocalStorage("default_car", function(error){
	if(!error) console.log('saved');
});
```

#### Model.getFromLocalStorage(unique_key, callback)
```
var car = new Car();
car.getFromLocalStorage("default_car", function(error){
	if(!error) console.log(car);
});
```

## RestKit.send()
Send simple HTTP request
This is based on the React Native fetch method. It has a simple error checking to check if the response status is not between 200-208 or 226.
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
request object: the same object used for fetch()

