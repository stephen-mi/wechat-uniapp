<template>
  <u-modal
    :show="show"
    :title="title"
    :width="width"
    confirmButtonShape="square"
    :closeOnClickOverlay="maskClose"
    @close="close"
  >
    <view style="width: 100%">
      <view class="modal-content font-bold font-size-base">
        <text
          >同意
          <text class="textLink" @click="goAgreement">《用户服务协议》</text
          >和<text class="textLink" @click="goAgreement"
            >《隐私协议》</text
          ></text
        >
      </view>
    </view>

    <template slot="confirmButton">
      <view class="modal-button-box">
        <button
          v-show="showCancelButton"
          class="modal-button button-cancel font-bold font-size-base"
          @click="cancel"
        >
          {{ cancelText }}
        </button>
        <button
          v-show="showConfirmButton"
          class="modal-button button-confirm font-bold"
          @click="confirm"
        >
          {{ confirmText }}
        </button>
      </view>
    </template>
  </u-modal>
</template>
    
<script>
export default {
  props: {
    showImg: {
      type: Boolean,
      default: true,
    },
    src: {
      type: String,
      default:
        "https://dps-edu.obs.cn-north-4.myhuaweicloud.com/static/images/modalimg.png",
    },
    title: {
      type: String,
      default: "",
    },
    show: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: "650rpx",
    },
    content: {
      type: String,
      default: "",
    },
    cancelText: {
      type: String,
      default: "取消",
    },
    confirmText: {
      type: String,
      default: "同意",
    },
    closeDuration: {
      type: Number,
      default: 0,
    },
    maskClose: {
      type: Boolean,
      default: false,
    },
    showConfirmButton: {
      type: Boolean,
      default: true,
    },
    showCancelButton: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    show: {
      handler(newVal, oldVal) {
        if (newVal && this.closeDuration) {
          setTimeout(() => {
            this.close();
          }, this.closeDuration);
        }
      },
    },
  },
  methods: {
    goAgreement() {
      wx.navigateTo({
        url: "/pages-person/agreement/index",
      });
    },
    confirm() {
      this.$emit("confirm");
    },
    close() {
      this.$emit("close");
    },
    cancel() {
      this.$emit("cancel");
    },
  },
};
</script>
    
<style lang="scss" scoped>

.modal-content {
  width: 100%;
  color: #666;
  .textLink {
    color: #268DFF;
  }
}
.modal-button-box {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.modal-button {
  width: 48%;
}
.button-cancel {
  color: #666;
  background-color: #fff;
  border: 1px solid #666;
}
.button-confirm {
  color: #FFF;
  background-color: #268DFF;
}
</style>