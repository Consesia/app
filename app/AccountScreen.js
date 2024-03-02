import * as fcl from "@onflow/fcl/dist/fcl-react-native";
import { StatusBar } from "expo-status-bar";
import { FlatList, Image, Text, TouchableOpacity, View , ActivityIndicator } from "react-native";
import { styled } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { RefreshControl } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { getAllPolls } from "../flow/scripts";
import { filter, reverse } from "lodash";
import { VoteItem } from "./HomeScreen";
import logout from "../assets/img/logout.png";

const StyledView = styled(View);

export default function AccountScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState("poll");
  const [user, setUser] = useState({ loggedIn: null });
  const [myPolls, setMyPolls] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [myVoted, setMyVoted] = useState(null);

  useEffect(() => fcl.currentUser.subscribe(setUser), []);

  useEffect(() => {
    fetchMyPolls();
  }, [myPolls]);

  const fetchMyPolls = async () => {
    getAllPolls()
      .then((res) => {
        setMyPolls(
          reverse(Object.values(res).filter((i) => i.createdBy == user.addr))
        );
        setMyVoted(
          filter(Object.values(res), (o) => o.votes.hasOwnProperty(user.addr))
        );
      })
      .catch((err) => console.log(err));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyPolls();
    setRefreshing(false);
  };

  return (
    <StyledView
      className="h-full flex"
      style={{
        backgroundColor: "#222222",
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <StatusBar style="light" />
      <StyledView className="h-48 flex items-center justify-center">
        <TouchableOpacity
          className="absolute top-[-30] right-[-20]"
          onPress={() => fcl.unauthenticate()}
        >
          <Image source={logout} className="h-36 w-24" />
        </TouchableOpacity>
        <StyledView className="border-2 w-24 h-24 p-1.5 border-white/20 rounded-full border-dashed mb-3">
          <Image
            className="w-20 h-20 object-cover rounded-full"
            source={{
              uri: `https://www.gravatar.com/avatar/${user?.addr}?s=200&r=pg&d=retro`,
            }}
          />
        </StyledView>
        <Text className="text-white text-lg">{user?.addr}</Text>
      </StyledView>
      <StyledView className="bg-dark flex-1 px-3 pt-3">
        <StyledView className="flex flex-row items-center gap-4 mb-3">
          <TouchableOpacity
            className="flex-1 h-10 rounded-full"
            onPress={() => setTab("poll")}
          >
            <StyledView
              className={`h-full rounded-full flex items-center justify-center flex-row ${
                tab === "poll" && "bg-white"
              }`}
            >
              <Text
                className={`font-medium ml-2 ${
                  tab === "poll" ? "text-dark" : "text-white"
                }`}
              >
                My Poll
              </Text>
            </StyledView>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 h-10 rounded-full"
            onPress={() => setTab("voted")}
          >
            <StyledView
              className={`h-full rounded-full flex items-center justify-center flex-row ${
                tab === "voted" && "bg-white"
              }`}
            >
              <Text
                className={`font-medium ml-2 ${
                  tab === "voted" ? "text-dark" : "text-white"
                }`}
              >
                My Voted
              </Text>
            </StyledView>
          </TouchableOpacity>
        </StyledView>
        {tab === "poll" && (
          (!myPolls? <ActivityIndicator size="large" color="#FACC15" /> :

          <FlatList
            data={myPolls}
            renderItem={({ item }) => (
              <VoteItem
                pollId={item.id}
                title={item.title}
                color={item.color}
                createdBy={item.createdBy}
                time={item.endedAt}
                navigation={navigation}
                cta="Detail"
              />
            )}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          />
        ))}
        {tab === "voted" && (
          
        (!myVoted? <ActivityIndicator size="large" color="#FACC15" /> :
          <FlatList
            data={myVoted}
            renderItem={({ item }) => (
              <VoteItem
                pollId={item.id}
                title={item.title}
                color={item.color}
                createdBy={item.createdBy}
                time={item.endedAt}
                navigation={navigation}
                cta="Detail"
              />
            )}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          />
        ))}
      </StyledView>
    </StyledView>
  );
}
