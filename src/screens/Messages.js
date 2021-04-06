import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {CometChat} from '@cometchat-pro/react-native-chat';
import {CometChatMessages} from '../cometchat-pro-react-native-ui-kit-master';

const Messages = ({route}) => {
	const {matchId, userName} = route.params;
	const avatar = `https://robohash.org/${userName}`;
	const [localUser, setLocalUser] = useState(null);
	useEffect(() => {
		var user = CometChat.getLoggedinUser().then(
			user => {
				console.log('user details:', {user});
				setLocalUser(user);
			},
			error => {
				console.log('error getting details:', {error});
			},
		);
	}, []);

	const userToChat = {
		uid: matchId,
		name: userName,
		avatar,
		hasBlockedMe: false,
		blockedByMe: false,
		role: 'default',
		status: 'online',
	};

	return (
		<View style={{flex: 1}}>
			{localUser ? (
				<CometChatMessages
					type={'user'}
					item={userToChat}
					loggedInUser={localUser}
					audioCall={false}
					videoCall={false}
				/>
			) : null}
		</View>
	);
};

export default Messages;
