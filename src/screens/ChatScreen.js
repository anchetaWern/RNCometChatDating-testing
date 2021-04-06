import React, {useState, useCallback, useContext, useEffect} from 'react';

import {View, ActivityIndicator} from 'react-native';
import {withTheme} from 'react-native-paper';
import {GiftedChat} from 'react-native-gifted-chat';
import {CometChat} from '@cometchat-pro/react-native-chat';

import {UserContext} from '../context/UserContext';

import {lower} from '../helpers/Str';

var receiverType = CometChat.RECEIVER_TYPE.USER;

const ChatScreen = ({route, theme}) => {
	const {colors} = theme;
	const {userId} = useContext(UserContext);
	const {matchId} = route.params;

	const [messages, setMessages] = useState([]);

	useEffect(() => {
		// get previous messages
		const currentTimestamp = new Date().getTime();
		const messagesRequest = new CometChat.MessagesRequestBuilder()
			.setUID(matchId)
			.setTimestamp(currentTimestamp)
			.setLimit(20)
			.build();

		messagesRequest.fetchPrevious().then(
			conversationList => {
				const old_messages = conversationList
					.map(item => {
						return {
							_id: item.id,
							text: item.text,
							createdAt: item.sentAt,
							user: {
								_id: item.sender.uid,
								name: item.sender.name,
								avatar: item.sender.avatar,
							},
						};
					})
					.reverse();

				setMessages(old_messages);
			},
			error => {
				console.log('Conversations list fetching failed with error:', error);
			},
		);

		const listenerID = `${userId}-${matchId}`;

		CometChat.addMessageListener(
			listenerID,
			new CometChat.MessageListener({
				onTextMessageReceived: message => {
					updateConversation({
						id: message.id,
						text: message.text,
						sender_id: message.sender.uid,
						sender_name: message.sender.name,
						sender_avatar: message.sender.avatar,
					});
				},
			}),
		);
	}, [userId, matchId]);

	const onSend = useCallback(
		([message]) => {
			var textMessage = new CometChat.TextMessage(
				matchId,
				message.text,
				receiverType,
			);

			CometChat.sendMessage(textMessage).then(
				msg => {
					updateConversation({
						id: msg.id,
						text: msg.text,
						sender_id: msg.sender.uid,
						sender_name: msg.sender.name,
						sender_avatar: msg.sender.avatar,
					});
				},
				error => {
					console.log('Message sending failed with error:', error);
				},
			);
		},
		[matchId],
	);

	const updateConversation = ({
		id,
		text,
		sender_id,
		sender_name,
		sender_avatar,
	}) => {
		setMessages(previousMessages =>
			GiftedChat.append(previousMessages, [
				{
					_id: id,
					text: text,
					createdAt: new Date(),
					user: {
						_id: sender_id,
						name: sender_name,
						avatar: sender_avatar,
					},
				},
			]),
		);
	};

	// next: render UI

	if (userId) {
		return (
			<GiftedChat
				messages={messages}
				onSend={messages => onSend(messages)}
				user={{
					_id: lower(userId),
				}}
			/>
		);
	}

	return (
		<View>
			<ActivityIndicator size="large" color={colors.primary} />
		</View>
	);
};

export default withTheme(ChatScreen);
