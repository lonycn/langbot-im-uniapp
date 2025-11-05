import $state from '../state/index.js';
export default () => {
  $state.conversation.reset()
  $state.notification.reset()
  $state.friend.reset()
  $state.group.reset()
  $state.currentConversationId = false
}
