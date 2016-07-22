/**
 * Documento Picker Demo
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';

import DocumentPicker from 'react-native-document-picker';

class DocumentPickerDemo extends Component {

  constructor(props){
    super(props);

    this.state = {
      url: null
    };

    this.onPress = this.onPress.bind(this);
  }

  onPress(){
    DocumentPicker.show({
      filetype: ['public.data']
    }).then( url => {
      this.setState({
        url
      })
    }).catch( err => {
      alert(err);
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Document Picker Demo
        </Text>
        {this.state.url &&
          <Text>
            Current document - {this.state.url}
          </Text>}
        <TouchableOpacity style={styles.button}
          onPress={this.onPress}>
          <Text style={styles.buttonText}>
            Pick a document
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  button: {
    padding: 15,
    backgroundColor: 'blue'
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  }
});

AppRegistry.registerComponent('DocumentPickerDemo', () => DocumentPickerDemo);
