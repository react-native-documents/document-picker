/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment } from 'react';
import { Button, SafeAreaView, StatusBar } from 'react-native';
import DocumentPicker from '../'


const App = () => {
  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <Button
          title={'popup test'}
          onPress={
            async ()=> {
              const result = await DocumentPicker.pick(
                {
                  type: [DocumentPicker.types.images]
                }
              )
              console.log(result)
            }
          }
        />
      </SafeAreaView>
    </Fragment>
  );
};

export default App;
