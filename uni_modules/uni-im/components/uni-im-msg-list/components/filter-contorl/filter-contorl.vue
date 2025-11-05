<template>
  <view class="filter-contorl" v-if="userIdList.length">
    <text class="title">已进入话题</text>
    <uni-im-icons class="exit" @click="userIdList=[]" code="e61a" color="#999" size="12px"></uni-im-icons>
    <uni-im-choose-user title="相关成员" :conversationId="conversationId" v-model="userIdList"></uni-im-choose-user>
  </view>
</template>

<script>
  export default {
    emits: ['showMenberList', 'change'],
    props: {
      conversationId: {
        default: ''
      },
    },
    data() {
      return {
        userIdList: []
      }
    },
    watch: {
      userIdList(newVal) {
        this.$emit('change', newVal)
      }
    },
    methods: {
      onchange(userIdList) {
        this.userIdList = userIdList
      }
    }
  }
</script>

<style lang="scss">
  .filter-contorl {
    justify-content: center;
    border-bottom: 2px #bee1ff solid;
    position: sticky;
    top: 0;
    background-color: #FFF;
    font-size: 14px;
    padding: 8px;
    width: 100%;
    z-index: 999;

    .title {
      font-size: 16px;
      font-weight: bold;
      color: #1399ff;
      margin-bottom: 5px;
    }

    .exit {
      position: absolute;
      right: 10px;
      top: 10px;
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }
    }
  }
</style>