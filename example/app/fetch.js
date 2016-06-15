import React, {Component} from 'react';
import {
    Text,
    View
} from 'react-native';
import RNBackbone from 'react-native-backbone';
import fetchStorage from 'react-native-backbone/src/storages/fetch';

class FetchStorageExample extends Component {

    constructor() {
        super();
        this.state = {
            isLoading: true
        };

        fetchStorage.globalOptions.headers = {
            "Authorization": "Bearer AUTH_TOKEN"
        };

        var Businesses = RNBackbone.Collection.extend({
            url: 'http://YOUR_URL/business'
        });

        var businesses = this.business = new Businesses();

        businesses.fetch({
            success: () => {
                this.setState({isLoading: false});
            },
            error: (model, error) => {
                console.log(error);
            }
        });
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View>
                    <Text>Fetching from API, please wait...</Text>
                </View>
            )
        } else {
            return (
                <View>
                    <Text>Successfully fetched {this.business.length} models from REST api</Text>
                </View>
            )
        }
    }
}

export default FetchStorageExample;