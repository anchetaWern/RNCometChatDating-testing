import React from 'react';
import {View, Text} from 'react-native';
import {CometChatConversationList} from '../cometchat-pro-react-native-ui-kit-master';

const DemoChatListScreen = ({navigation}) => {
	return (
		<View style={{flex: 1}}>
			<CometChatConversationList
				onItemClick={item => {
					console.log(item);
				}}
				navigation={navigation}
			/>
		</View>
	);
};

export default DemoChatListScreen;
