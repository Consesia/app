import { StatusBar } from "expo-status-bar";
import { FlatList, Image, Pressable, RefreshControl, Text, View , ActivityIndicator} from "react-native";
import { styled } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { getActivePolls } from "../flow/scripts";
import { useEffect, useState } from "react";
import { reverse } from "lodash";
import moment from "moment";
import share from "../assets/img/share.png";

const StyledView = styled(View);

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [polls, setPolls] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async() => {
    getActivePolls()
      .then((res) => {
        setPolls(reverse(Object.values(res)))
      })
      .catch((err) => console.log(err));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPolls();
    setRefreshing(false);
  }

  return (
    
    <StyledView
      className="bg-dark h-full"
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
      }}
    >
      <StatusBar style="light" />
      <Image className="h-6 w-32 mt-3 mb-6" source={require("../assets/img/logo.png")} />
      <Text className="text-white opacity-50 tracking-widest font-bold text-xs mb-2">ONGOING POLL</Text>

      {!polls? <ActivityIndicator size="large" color="#FACC15" /> :

      <FlatList
        data={polls}
        renderItem={({ item }) => <VoteItem pollId={item.id} title={item.title} color={item.color} createdBy={item.createdBy} time={item.endedAt} navigation={navigation} />}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      />}
    </StyledView>
  );
}

export const VoteItem = ({ pollId, title, color, createdBy, time, navigation, cta = 'Vote Now' }) => (
  <StyledView className={`w-full p-4 rounded-xl mb-4 ${color}`}>
    <StyledView className="flex flex-row items-center justify-between mb-2">
      <StyledView className="flex flex-row items-center">
        <Image className="w-4 h-4 object-cover rounded-full mr-2" source={{ uri: `https://www.gravatar.com/avatar/${createdBy}?s=200&r=pg&d=retro` }} />
        <Text className="text-white opacity-50 text-xs">{createdBy.substr(0,4)}...{createdBy.substr(-4,4)}</Text>
      </StyledView>
      <Text className="text-white opacity-50 text-xs">End {moment(new Date(time * 1000)).fromNow()}</Text>
    </StyledView>
    <Text className="text-white font-bold text-2xl mb-3">{title}</Text>
    <StyledView className="flex flex-row items-center justify-between mb-2 gap-2">
      <Pressable onPress={() => navigation.navigate("VoteDetail", {
        pollId: pollId
      })} className="flex-1 flex justify-center items-center bg-black/20 h-12 rounded-full">
        <StyledView>
          <Text className="text-white font-bold">{cta}</Text>
        </StyledView>
      </Pressable>
      <Pressable onPress={() => null} className="shrink-0 flex justify-center items-center bg-black/20 h-12 w-12 rounded-full">
          <Image source={share} className=" w-16 h-16" />
      </Pressable>
    </StyledView>
  </StyledView>
);