import React, {useState, useCallback, useEffect, useContext} from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {createStackNavigator} from '@react-navigation/stack';

import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import SplashScreen from './screens/SplashScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import MainTabScreen from './screens/MainTabScreen';

import {UserContext} from './context/UserContext';

import config from './config';

const Stack = createStackNavigator();

const usersCollection = firestore().collection('users');

const Home = () => {
  const {isLoading, setIsLoading, isLoggedIn, setUser, unsetUser} = useContext(
    UserContext,
  );

  function onAuthStateChanged(user) {
    console.log('setting user: ', JSON.stringify(user));
    if (user) {
      console.log('user: ', user);

      usersCollection
        .where('auth_uid', '==', user.uid)
        .limit(1)
        .get()
        .then(querySnapshot => {
          if (querySnapshot.size) {
            querySnapshot.forEach(documentSnapshot => {
              const user_data = documentSnapshot.data();

              console.log('user datas: ' + JSON.stringify(user_data));
              setUser(user.uid, user_data.name, user_data.gender);
            });
          }
        });
    } else {
      console.log('out');
      setIsLoading(false);
      unsetUser();
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const logout = useCallback(async () => {
    await auth().signOut();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        {!isLoggedIn && (
          <React.Fragment>
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          </React.Fragment>
        )}

        {isLoggedIn && (
          <Stack.Screen
            name="MainTab"
            component={MainTabScreen}
            options={{
              title: config.APP_TITLE,
              headerRight: () => (
                <TouchableOpacity onPress={logout}>
                  <View style={styles.buttonContainer}>
                    <Text>Logout</Text>
                  </View>
                </TouchableOpacity>
              ),
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 10,
  },
});

export default Home;
