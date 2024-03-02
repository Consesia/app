import { StatusBar } from "expo-status-bar";
import { FlatList, Image, Pressable, RefreshControl, Text, View } from "react-native";
import { styled } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { getActivePolls } from "../flow/scripts";
import { useEffect, useState } from "react";
import { reverse } from "lodash";
import moment from "moment";

const StyledView = styled(View);

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [polls, setPolls] = useState([]);

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