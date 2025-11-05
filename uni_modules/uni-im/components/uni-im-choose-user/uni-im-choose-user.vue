<template>
  <view class="user-list">
    <text class="title" v-if="title">{{title}}：</text>
    <view class="item" v-for="(user,index) in userList" :key="index">
      <uni-im-img class="avatar" width="20" height="20" borderRadius="100%"
        :src="user?.avatar_file?.url || '/uni_modules/uni-im/static/avatarUrl.png'"></uni-im-img>
      <text class="nickname">{{user.nickname}}</text>
      <uni-im-icons class="delete" @click="deleteItem(index)" code="e61a" color="#888" size="10px"></uni-im-icons>
    </view>
    <view class="add-icon" v-if="multiple || userList.length === 0">
      <uni-icons @click="showMemberList" color="#aaa" size="16px" type="plusempty"></uni-icons>
    </view>
    <uni-im-member-list ref="member-list" :conversationId="conversationId" :memberListData="memberListData"></uni-im-member-list>
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  export default {
    emits: ['update:modelValue'],
    props: {
      modelValue: {
        type: Array,
        default: []
      },
      filterUids: {
        type: [Array,null],
        default: null
      },
      conversationId: {
        default: '',
      },
      memberListData: {
        type: [Array,null],
        default: null
      },
      title: {
        type: [String,null],
        default: null
      },
      multiple: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        
      }
    },
    computed: {
      userList() {
        return uniIm.users.find(this.modelValue)
      }
    },
    methods: {
      deleteItem(index) {
        this.$emit('update:modelValue', this.modelValue.filter((_, i) => i !== index))
      },
      showMemberList() {
        this.$refs['member-list'].show({
          title: '添加话题成员',
          forceShowSearch: true,
          filter: member => !(this.filterUids || this.modelValue).includes(member.users._id),
          confirm: (uid) => {
            console.log('uid--showMenberList-*', uid)
            this.$emit('update:modelValue', this.modelValue.concat(uid))
          }
        })
      },
    }
  }
</script>

<style lang="scss">
.user-list {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;

  .title {
    font-size: 14px;
    color: #555;
    font-weight: unset;
  }

  .item {
    font-size: 14px;
    padding: 0 3px;
    margin-left: 6px;
    margin-top: 5px;
    border: 1px solid #eee;
    border-radius: 5px;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    .avatar {
      margin-right: 5px;
    }

    .nickname {
      color: #333;
    }

    .delete {
      margin: 0 5px;
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }
    }

    height: 26px;
  }
  .add-icon {
    cursor: pointer;
    border: 1px #aaa dashed;
    height: 26px;
    width: 26px;
    justify-content: center;
    margin-left: 10px;
  }
}
</style>
