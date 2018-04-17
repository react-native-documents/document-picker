/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {Button, ListView, Text, View} from 'react-native';

import DocumentPicker from 'react-native-document-picker'


function rowHasChanged(r1, r2)
{
  return r1 !== r2
}
const ds = new ListView.DataSource({rowHasChanged})


type Props = {};
export default class App extends Component<Props> {
  constructor() {
    super()

    this.state = {dataSource: ds.cloneWithRows([])}
  }

  _onPress() {
    this.setState({dataSource: ds.cloneWithRows([]), error: undefined})

    DocumentPicker.pickMultiple()
    .then(files => this.setState({dataSource: ds.cloneWithRows(files)}),
          error => this.setState({error}))
  }

  _renderRow({name, size, type, uri}) {
    return (
      <View>
        <Text>Name: {name}</Text>
        <Text>Size: {size}</Text>
        <Text>Type: {type}</Text>
        <Text>Uri: {uri}</Text>
      </View>
    )
  }

  render() {
    const {dataSource, error} = this.state

    return (
      <View>
        <Button onPress={this._onPress.bind(this)} title="Select files"/>
        <Text>{error && error.toString()}</Text>
        <Text>{error && error.stack}</Text>
        <ListView dataSource={dataSource} renderRow={this._renderRow}/>
      </View>
    );
  }
}
