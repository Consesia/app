import { ActivityIndicator, Button, FlatList, Image, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styled } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { getDetailPoll, getPollResult } from "../flow/scripts";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import * as fcl from "@onflow/fcl/dist/fcl-react-native";
import { addVoter, votePoll } from "../flow/transactions";
import { find, map, sum } from "lodash";
