/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment } from 'react';
import { Button, SafeAreaView, StatusBar,Platform } from 'react-native';
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
              try {
                const res = await DocumentPicker.pick({
                  type: [DocumentPicker.types.images],
                });
                console.log(
                  res.uri,
                  res.type, // mime type
                  res.name,
                  res.size
                );
                let result = await fetch(res.uri)
                const blob = await result.blob()
                console.log(blob);
                console.log(result)
              } catch (err) {
                console.error(err)
                if (DocumentPicker.isCancel(err)) {
                  // User cancelled the picker, exit any dialogs or menus and move on
                } else {
                  throw err;
                }
              }
            }
          }
        />
      </SafeAreaView>
    </Fragment>
  );
};

export default App;
