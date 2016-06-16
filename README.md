# react-native-backbone

As react native does not support Node.js HTTP module, react-native-backbone helps you to connect to your REST api or localStorage much easier using the same concept of Backbone models and collections.
* You can simply call "save", "fetch", "destroy" method on each model to sycn them to your REST api.
* "fetch" collections from REST api.
* Using model.get() to retrieve data from model
* Add an extra layer of the fetch method to check if the status API returns is not 200. Returns an json file instead of response object.

To do:
* syncronize with localStorage

### Table of content
* [Setup](#install)
* [RNBackbone.Model](#rnbackbonemodel)
* [RNBackbone.Collection](#rnbackbonecollection)
* [RNBackbone.Storage](#storage)
	* [fetchStorage](#fetchstorage)
	* [realmStorage](#realm)

## Install

The easiest way to install: `npm install react-native-backbone`

And require it in your React Native app: `var RNBackbone = require('react-native-backbone');` or ES6: `import RNBackbone from 'react-native-backbone'`;

## RNBackbone.Model
RNBackbone.Model is extended from backbone. The usages is almost the same as Backbone.Model, but some methods might be differnt. 

#### Create a model class
```
var Car = RNBackbone.Model.extend({
	rootUrl = "http://www.your-domain.com/car"
	//More options to be added
});
```
rootUrl: the root url where this model connects to.
* value: `String` or `function`. If its a function it should return a string.

#### Create an instance
```
var bmw = new Car({
	"make": "BMW",
	"model": "428i",
	"year": 2014
})
```
You can create a model using the `new` keyword. You can pass an object as the initial value of the model, you can also create an empty model.

#### Model methods:
##### set():
```
bmw.set('mpg', '23')
```
this will set the atrribute mpg to 23.
* If the attribute does not exist, this attribute will be added to the model.
* If the attribute does exist, the value will be replaced.

You can also pass a json object as the argument:
```
bmw.set({
	"mpg": 23,
	"color": "white"
})
```

##### unset():
```
bmw.unset('mpg', '23')
```
The attribute "mpg" will be deleted
* Unset does not take json object or array as argument.

##### isNew():
```
bmw.isNew();
```
This will return ture if "id" attribute does not exist

##### save():
```
var option = {
	headers:{
		"Authentiacation":"Bearer SOME_TOKEN"
	}
}

bmw.save(option, function(error){
    if(error) console.log(error);
    console.log(people);
});
```
Save this model to the server, this is POST for new model and PUT for existing model
* option: (optional)
** option.headers: the headers to be added to the HTTP request

##### fetch():
```
bmw = new Car({
	id: 1
});

bmw.fetch(function(error){
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
bmw.delete(option, function(error){
    if(error) console.log(error);
});
```
Delete this model to the server, this is DELETE method
* To delete an model, ID has to be set.
* option: (optional)
** option.headers: the headers to be added to the HTTP request

## RNBackbone.Collection
There is only one sync method supported for collection: fetch
```
var Cars = RNBackbone.Colletion.extend({
	model: Car,
	url: 'https://YOUR_URL/cars
});
var cars = new Cars();
cars.fetch({
	success: ()=>{
		console.log(cars);
	}
})
```

## Storage
As of react-native-backbone 0.1.0, we provides two different storage connectors.

### fetchStorage
fetchStorage is the default storage connectors used by RNBackbone. It uses the built-in "fetch" method of React-Native

#### fetchStorage.globalOption.headers
If you want to send some headers in every request, you can set it up here.
```
import fetchStorage from 'react-native-backbone/src/storages/fetch'
fetchStorage.globalOption.headers:{
	"Authentiacation":"Bearer SOME_TOKEN"
}
```

#### fetchStorage.send()
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

fetchStorage.send(url, request, function(error, json){
                if(error)
                    console.log("encoutered error: ", error);
                console.log(json);
            });
```
request object: the same object used for fetch()

### Realm
React Native's "asycnStorage" is a key-value pair storage, which is not ideal for the backbone concept.
react native backbone uses a JavaScript library [Realm](https://realm.io/products/react-native/) for local storage

#### Setting up Realm
* RNBackbone has declared Realm as its dependency. But if you plan to use Realm in your project, you have to set it up using [rnpm](https://github.com/rnpm/rnpm):
`rpm link realm`
* Then you have to config RNBackbone to use Realm:
```
import RNBackbone from 'react-native-backbone';
import realmStorage from 'react-native-backbone/src/storages/realm';
RNBackbone.storage = realmStroage;
```
* Realm requires you to declare the schema of each Models before using them:
```
	const CarSchema = {
	  name: 'Car',
	  properties: {
		 make:  'string',
		 model: 'string',
		 miles: {type: 'int', default: 0},
	  }
   }; 
```
_Realm doc about models: https://realm.io/docs/react-native/latest/#models_

* Initialize realmStorage:
	* Realm requires to provide **ALL** schemas before using it.
	* realmStorage connector's `init()` methods allows RNBackbone to create a Realm instance using your schemas.
```
realmStorage.init({
  models: [Car, People]
});
```
_Realm doc about models: https://realm.io/docs/react-native/latest/#models_

Now you can start using RNBackbone as normal
