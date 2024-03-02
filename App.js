import "./flow/config";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image, Text, TouchableOpacity, View } from "react-native";
import HomeScreen from "./app/HomeScreen";
import VoteDetailScreen from "./app/VoteDetailScreen";
import AccountScreen from "./app/AccountScreen";
import Feather from "@expo/vector-icons/Feather";
import NewPollScreen from "./app/NewPollScreen";
import * as fcl from "@onflow/fcl/dist/fcl-react-native";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";

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
      <Image className="h-6 w-32 mt-3 mb-3" source={require("./assets/img/logo.png")} />
      <Text className="font-bold text-white mb-12">Mobile Voting on the Blockchain</Text>

      <Text className="text-white/50 mb-3">Connect Your Wallet to Continue</Text>
      {!isLoading &&
        services.map((service, index) => (
          <TouchableOpacity onPress={() => authenticateService(service)} key={service?.provider?.address ?? index}>
            <View className="w-64 p-1 rounded-full flex flex-row items-center justify-center" style={{ backgroundColor: service?.provider?.color }}>
              <Image className="h-6 w-6 mt-3 mb-2 mr-2" source={{ uri: service?.provider?.icon }} />
              <Text className="text-dark font-bold">{service?.provider?.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
    </View>
  );
}