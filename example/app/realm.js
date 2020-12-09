import React, {Component} from 'react';
import {
    Text,
    View
} from 'react-native';
import RNBackbone from 'react-native-backbone';
import realmStorage from 'react-native-backbone/src/storages/realm';

//Config RNBackbone to use Realm as storage
RNBackbone.storage = realmStorage;

var Business = RNBackbone.Model.extend({
    realmSchema:{
        name: 'Business',
        properties: {
            name: 'string'
        }
    }
});

var Businesses = RNBackbone.Collection.extend({
    model: Business
});

//It is very important to initialize Realm with all your models before using RNBackbone
realmStorage.init({
    models: [Business]
});

class RealmStorageExample extends Component {

    constructor() {
        super();
        this.state = {
            isLoading: true
        };
    }

    componentDidMount() {
        var business = new Business({
            name: 'some company'
        });

        var businesses = this.businesses = new Businesses();
        business.save(null, {
            success: () =>{
                businesses.fetch({
                    success: () => {
                        this.setState({
                            isLoading: false
                        })
                    }
                })
            }
        });
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View>
                    <Text>Fetching from localStorage, please wait...</Text>
                </View>
            )
        } else {
            return (
                <View>
                    <Text>Successfully fetched {this.businesses.length} models from REST api</Text>
                    <Text>This example is creating a new object each time you reload it...</Text>
                </View>
            )
        }
    }
}

export default RealmStorageExample;
