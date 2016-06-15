import React, { Component } from 'react';
import {
    Text,
    View
} from 'react-native';
import {RNBackbone} from 'react-native-rest-kit';

// var businesses =
// realmStorage.init({
//     models: [TableModel]
// });

RNBackbone.storage = fetchStorage;

fetchStorage.globalOptions.headers = {
    "Authorization":"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6IjFAMS5jb20iLCJpYXQiOjE0NjE0NzY4MzB9.VSx6O_qYgEl6w2ltn5Ac6wn7u8eEJfHzDklw1gf051U"
};