import "./flow/config";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image, Text, TouchableOpacity, View } from "react-native";
import HomeScreen from "./app/HomeScreen";
import VoteDetailScreen from "./app/VoteDetailScreen";
import AccountScreen from "./app/AccountScreen";
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import NewPollScreen from "./app/NewPollScreen";
import * as fcl from "@onflow/fcl/dist/fcl-react-native";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import home from "./assets/img/home.png";
import plus from "./assets/img/plus.png";
import user from "./assets/img/profile.png";
import share from "./assets/img/share.png";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState({ loggedIn: null });
  const { services, isLoading, authenticateService } = fcl.useServiceDiscovery({ fcl });
  useEffect(() => fcl.currentUser.subscribe(setUser), []);

  const MyTheme = {
    ...DarkTheme,
    dark: true,
    colors: {
      ...DarkTheme.colors,
      primary: "#FACC15",
    },
  };

  if (user.loggedIn) {
    return (
      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator
          initialRouteName="Homes"
          screenOptions={({ route }) => ({
            headerShown: route.name !== "Homes",
          })}
        >
          <Stack.Screen name="Homes">
            {() => (
              <Tab.Navigator
                initialRouteName="Home"
                screenOptions={({ route }) => ({
                  headerShown: false,
                })}
                tabBar={(props) => <MyTabBar {...props} />}
              >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="NewPoll" component={NewPollScreen} />
                <Tab.Screen name="Account" component={AccountScreen} />
              </Tab.Navigator>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="VoteDetail"
            component={VoteDetailScreen}
            options={{
              headerTitle: "Vote Detail",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <View className="flex h-full items-center justify-center bg-dark">
      <StatusBar style="light" />
      <Image className="h-6 w-56 mt-3 mb-8 p-5" source={require("./assets/img/logo.png")} />
      <Text className="font-bold text-white mb-12">Mobile Voting on the Blockchain</Text>

      <Text className="text-white/50 mb-3">Connect Your Wallet to Continue</Text>
      {!isLoading &&
        services.map((service, index) => (
          <TouchableOpacity onPress={() => authenticateService(service)} key={service?.provider?.address ?? index}>
            <View className=" w-64 h-10 p-1 rounded-full flex flex-row items-center justify-center" style={{ backgroundColor: service?.provider?.color }}>
              <Text className="text-dark font-bold">{service?.provider?.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
    </View>
  );
}

function MyTabBar({ state, descriptors, navigation }) {
  return (
    <View className="h-20 flex flex-row items-center justify-between gap-1" style={{ backgroundColor: "#222222" }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={{ flex: 1 }}
            key={label}
          >
            <View className="h-full flex items-center justify-center mb-2">
              {label === "Home" && (
                <View className={`w-12 h-12 rounded-full flex items-center justify-center`}>
                  <Image source={home} className={`w-24 h-24 `} />
                </View>
              )}
              {label === "NewPoll" && (
                <View className={`flex flex-row gap-1 items-center justify-center rounded-full w-36 h-12 ${isFocused ? "bg-white" : "bg-white/10"}`}>
                  <Text className={`font-bold text-sm ${isFocused ? "text-dark" : "text-white"}`}>New Poll</Text>
                </View>
              )}
              {label === "Account" && (
                <View className={`w-12 h-12 rounded-full flex items-center justify-center`}>
                  <Image source={user} className=" w-48 h-48" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
