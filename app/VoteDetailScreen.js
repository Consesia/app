import { ActivityIndicator, Button, FlatList, Image, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styled } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { getDetailPoll, getPollResult } from "../flow/scripts";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import * as fcl from "@onflow/fcl/dist/fcl-react-native";
import { addVoter, votePoll } from "../flow/transactions";
import { find, map, sum } from "lodash";


const StyledView = styled(View);

export default function VoteDetailScreen({ route, navigation }) {
  const [user, setUser] = useState({ loggedIn: null });
  const insets = useSafeAreaInsets();
  const { pollId } = route.params;
  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState();
  const [newVoter, setNewVoter] = useState("");
  const [voters, setVoters] = useState([]);
  const [result, setResult] = useState();
  const [hasVoted, setHasVoted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => fcl.currentUser.subscribe(setUser), []);

  useEffect(() => {
    if (pollId) {
      fetchPoll(pollId);
      fetchResult(pollId);
    }
  }, [pollId]);

  useEffect(() => {
    if (poll) {
      setHasVoted(poll?.votes[user?.addr] ?? false);

      // set voters
      let voteData = [];
      map(poll?.votes, (val, key) => voteData.push({ address: key, vote: val }));
      setVoters(voteData);

      // set allowed voters
      if (poll.isRestricted) {
        let allowedData = [];
        map(poll?.allowedVoters, (val, key) => allowedData.push({ address: key, vote: poll?.votes[key] ?? "" }));
        setVoters(allowedData);
      }
    }
  }, [poll]);

  const fetchPoll = async (pollId) => {
    await getDetailPoll(pollId)
      .then((res) => {
        setPoll(res);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchResult = async (pollId) => {
    getPollResult(pollId)
      .then((res) => {
        setResult(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleVoted = async (option) => {
    if (hasVoted) {
      return;
    }

    if (poll.isRestricted && !find(voters, (r) => r.address === user?.addr)) {
      return Toast.show({ type: "error", text1: "You're not allowed to vote" });
    }

    setLoading(true);

    try {
      const txId = await votePoll(pollId, option).catch((err) => console.log(err));
      fcl.tx(txId).subscribe((e) => {
        if (e?.statusString != "") {
          Toast.show({ type: "info", text1: e?.statusString });
        }
      });
      await fcl.tx(txId).onceSealed();
      await fetchPoll(pollId);
      await fetchResult(pollId);

      setLoading(false);
      Toast.show({ type: "success", text1: "Success", text2: "Thanks for your vote!", position: "bottom" });
    } catch (error) {
      setLoading(false);
      console.log(error);
      Toast.show({ type: "error", text1: "Failed", text2: error.split("panic: ")[1], position: "bottom" });
    }
  };

  const handleNewVoter = async () => {
    setLoading(true);
    if (newVoter == "") {
      setLoading(false);
      return Toast.show({ type: "error", text1: "Error: Wallet Address", text2: "Wallet Address is required" });
    }

    try {
      const txId = await addVoter(pollId, newVoter).catch((err) => console.log(err));
      fcl.tx(txId).subscribe((e) => {
        if (e?.statusString != "") {
          Toast.show({ type: "info", text1: e?.statusString });
        }
      });
      await fcl.tx(txId).onceSealed();
      await fetchPoll(pollId);
      await fetchResult(pollId);

      setLoading(false);
      setModalVisible(false);
      Toast.show({ type: "success", text1: "Success", text2: "Success add new voter", position: "bottom" });
    } catch (error) {
      setLoading(false);
      console.log(error);
      Toast.show({ type: "error", text1: "Failed", text2: error?.split("panic: ")[1], position: "bottom" });
    }
  };

  if (loading) {
    return (
      <StyledView className="h-full bg-dark flex flex-col items-center justify-center">
        <ActivityIndicator />
        <Toast />
      </StyledView>
    );
  }

  return (
    <StyledView
      className="h-full bg-dark flex flex-col"
      style={{
        paddingTop: 8,
        paddingLeft: insets.left + 16,
        paddingRight: insets.right + 16,
        paddingBottom: insets.paddingBottom,
      }}
    >
      <StatusBar style="light" />
      <ScrollView className="flex-1">
        <StyledView className={`p-4 rounded-xl ${poll?.color} mb-4`}>
          <StyledView className="flex flex-row items-center justify-between">
            <StyledView className="flex flex-row items-center">
              <Image
                className="w-4 h-4 object-cover rounded-full mr-2"
                source={{ uri: `https://www.gravatar.com/avatar/${poll?.createdBy}?s=200&r=pg&d=retro` }}
              />
              <Text className="text-white text-xs">
                {poll?.createdBy.substr(0, 4)}...{poll?.createdBy.substr(-4, 4)}
              </Text>
            </StyledView>
            <Text className="text-white text-xs">Ended {new Date(poll?.endedAt * 1000).toLocaleString()}</Text>
          </StyledView>
        </StyledView>
        <StyledView className={`p-4 rounded-xl bg-zinc-800`}>
          <Text className="text-white mb-2 text-2xl font-semibold">{poll?.title}</Text>
          {poll?.options?.map((i) => (
            <StyledView className="flex flex-row items-center" key={i}>
              <TouchableOpacity onPress={() => handleVoted(i)} className="flex-1">
                <StyledView className={`relative w-full p-4 rounded-lg mt-2 bg-zinc-700`}>
                  {result && hasVoted && (
                    <StyledView
                      className={`absolute top-0 left-0 bottom-0 rounded-lg ${hasVoted === i ? poll?.color : "bg-zinc-900"}`}
                      style={{ right: `${100 - ((result[i] ?? 0) / sum(map(Object.values(result), (r) => parseInt(r)))) * 100}%` }}
                    ></StyledView>
                  )}
                  <Text className="text-white text-lg">{i}</Text>
                </StyledView>
              </TouchableOpacity>
              {result && hasVoted && (
                <StyledView className="w-8 flex items-center justify-center">
                  <Text className="text-white/50 font-bold">{result[i] ?? 0}</Text>
                </StyledView>
              )}
            </StyledView>
          ))}
        </StyledView>

        <StyledView className="mt-8">
          <StyledView className="flex flex-row items-center justify-between mb-4">
            <Text className="text-white/50 text-xl font-bold">Voters ({voters.length})</Text>
            {poll?.isRestricted && (poll?.createdBy === user?.addr) && (
              <>
                <Pressable onPress={() => setModalVisible(true)}>
                  <Text className="font-bold text-amber-400">+ Voter</Text>
                </Pressable>
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setModalVisible(!modalVisible);
                  }}
                >
                  <StyledView className="h-full w-full flex items-center justify-center bg-black/50">
                    <StyledView className="w-3/4 bg-white rounded-xl p-4">
                      <Text className="font-bold text-lg mb-4">Add Voters</Text>

                      <Text className="text-dark/70 mb-2">Wallet Address</Text>
                      <TextInput
                        onChangeText={setNewVoter}
                        value={newVoter}
                        className="w-full h-14 bg-dark/10 rounded-xl px-4 text-dark mb-4 border border-dark/20"
                      />

                      <StyledView className="flex flex-row items-center justify-end">
                        <Pressable
                          onPress={() => {
                            setNewVoter("");
                            setModalVisible(!modalVisible);
                          }}
                          className="px-4 py-2 bg-zinc-200 rounded mr-2"
                        >
                          <Text>Cancel</Text>
                        </Pressable>
                        <Pressable onPress={() => handleNewVoter()} className="px-4 py-2 bg-amber-400 rounded">
                          <Text>Submit</Text>
                        </Pressable>
                      </StyledView>
                    </StyledView>
                  </StyledView>
                </Modal>
              </>
            )}
          </StyledView>
          {/* <FlatList data={voters} renderItem={({ item }) => <VotersItem address={item.address} vote={item.vote} />} keyExtractor={(item) => item.address} /> */}
          {voters.map((i) => (
            <VotersItem address={i.address} vote={i.vote} key={i.address} />
          ))}
        </StyledView>
      </ScrollView>
      <Toast />
    </StyledView>
  );
}
