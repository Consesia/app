import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Button, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styled } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { uniq } from "lodash";
import { createNewPoll } from "../flow/transactions";
import * as fcl from "@onflow/fcl/dist/fcl-react-native";

const StyledView = styled(View);

const colors = ["bg-zinc-800", "bg-blue-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-rose-500"];

export default function NewPollScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState("bg-zinc-800");
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [startedAt, setStartedAt] = useState(new Date());
  const [endedAt, setEndedAt] = useState(new Date());
  const [isRestricted, setIsRestricted] = useState(false);

  const handlePostPoll = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    if (title == "") {
      return Toast.show({ type: "error", text1: "Error: Title", text2: "Title is required" });
    }

    if (options.length < 2) {
      return Toast.show({ type: "error", text1: "Error: Options", text2: "Create another options please, min. 2" });
    }

    if (uniq(options).length !== options.length) {
      return Toast.show({ type: "error", text1: "Error: Options", text2: "Options must be unique" });
    }

    try {
      const txId = await createNewPoll(title, options, color, (Date.parse(startedAt) / 1000).toFixed(1), (Date.parse(endedAt) / 1000).toFixed(1), isRestricted);
      fcl.tx(txId).subscribe((e) => {
        if (e?.statusString != "") {
          Toast.show({ type: "info", text1: e?.statusString });
        }
      });
      await fcl.tx(txId).onceSealed();
      setLoading(false);
      Toast.show({ type: "success", text1: "Success", text2: "Poll has been published" });
      setTitle("");
      setOptions(["", ""]);
      setTimeout(() => {
        return navigation.navigate("Home");
      }, 2500);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <StyledView
      className="h-full bg-dark flex flex-col"
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left + 16,
        paddingRight: insets.right + 16,
        paddingBottom: 20,
      }}
    >
      <StatusBar style="light" />
      <ScrollView className="flex-1 mb-4">
        <Text className="text-white/70 mb-2 mt-6">Create new poll</Text>
        <StyledView className={`p-5 rounded-xl ${color}`}>
          <Text className="text-white mb-2">Enter your title/question</Text>
          <TextInput onChangeText={setTitle} value={title} className="w-full h-14 bg-white/20 rounded-xl px-4 text-white mb-8 border border-white/20" />

          <Text className="text-white mb-2">Poll options</Text>
          {options.map((i, idx) => (
            <StyledView key={`opt-${idx}`} className="flex flex-row items-center">
              <Text className="text-white/25 font-bold mr-4">{idx + 1}</Text>
              <TextInput
                onChangeText={(val) => {
                  const lastOptions = [...options];
                  lastOptions[idx] = val;
                  setOptions(lastOptions);
                }}
                value={i}
                className="flex-1 h-14 bg-white/20 rounded-xl px-4 text-white mb-2 border border-white/20"
              />
              <TouchableOpacity
                className="ml-4"
                onPress={() => {
                  const lastOptions = [...options];
                  lastOptions.splice(idx, 1);
                  setOptions(lastOptions);
                }}
              >
                <Feather name="trash" size={16} color="#f43f5e" />
              </TouchableOpacity>
            </StyledView>
          ))}

          <Button title="Add Option" onPress={() => setOptions((prev) => [...prev, ""])} />
        </StyledView>

        <Text className="text-white/70 mb-2 mt-6">Color</Text>
        <StyledView className="flex flex-row gap-3">
          {colors.map((i) => (
            <TouchableOpacity onPress={() => setColor(i)} key={i}>
              <StyledView className={`w-12 h-12 rounded-full border-4 ${i} ${i === color ? "border-white" : "border-dark"}`} key={i}></StyledView>
            </TouchableOpacity>
          ))}
        </StyledView>

        <Text className="text-white/70 mb-2 mt-8">Schedule</Text>
        <StyledView className="flex flex-row gap-3">
          <StyledView className="flex-1 bg-white/10 rounded-lg p-4">
            <Text className="text-white font-bold mb-1">Started at</Text>
            <Text className="text-white/70 text-xs mb-2">{startedAt.toLocaleString()}</Text>
            <DateTimePicker
              testID="dateTimePicker"
              display="compact"
              themeVariant="dark"
              value={startedAt}
              mode="datetime"
              is24Hour={true}
              onChange={(value, currentDate) => setStartedAt(currentDate)}
              className="text-white"
            />
          </StyledView>
          <StyledView className="flex-1 bg-white/10 rounded-lg p-4">
            <Text className="text-white font-bold mb-1">Ended at</Text>
            <Text className="text-white/70 text-xs mb-2">{endedAt.toLocaleString()}</Text>
            <DateTimePicker
              testID="dateTimePicker"
              display="compact"
              themeVariant="dark"
              value={endedAt}
              mode="datetime"
              is24Hour={true}
              onChange={(value, currentDate) => setEndedAt(currentDate)}
              minimumDate={startedAt}
              className="text-white"
            />
          </StyledView>
        </StyledView>

        <Text className="text-white/70 mb-2 mt-8">Settings</Text>
        <StyledView className="flex flex-row gap-3">
          <StyledView className="flex-1 bg-white/10 rounded-lg p-4">
            <Text className="text-white font-bold mb-1">Restricted</Text>
            <Text className="text-white/70 text-xs mb-2">Only invited users can vote</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#fffbeb" }}
              thumbColor={isRestricted ? "#fbbf24" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setIsRestricted}
              value={isRestricted}
            />
          </StyledView>
          <StyledView className="flex-1 p-4"></StyledView>
        </StyledView>
      </ScrollView>
      <TouchableOpacity onPress={handlePostPoll}>
        <StyledView
          className={`w-full h-14 bg-amber-400 rounded-full flex flex-row items-center justify-center shadow shadow-amber-500/50 ${loading && "opacity-75"}`}
        >
          {loading ? <ActivityIndicator /> : <Feather name="send" size={16} color="#222" />}
          <Text className="font-bold ml-2">{loading ? "POSTING..." : "POST NOW"}</Text>
        </StyledView>
      </TouchableOpacity>

      <Toast />
    </StyledView>
  );
}
