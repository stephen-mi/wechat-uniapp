<template>
	<view class="container">
		<view class="top">
			<u-search placeholder="请输入关键字" v-model="keyword" :clearabled="true" @search="search" @blur="blur"
				@clear="clear"></u-search>
			<u-gap height="10" bgColor="#fff"></u-gap>
		</view>

		<view v-if="albums.length > 0" class="list">
			<view v-for="(group, index) in albums" :key="index">
				<u-collapse>
					<u-collapse-item :title="group.date">
						<u-grid :border="false" col="3">
							<u-grid-item v-for="(photoItem, photoIndex) in group.photos" :key="photoIndex">
								<image :src="photoItem.url" class="photo" @click="previewImage(photoIndex)">
								</image>
								<u-radio-group v-model="radiovalue" placement="row" @change="groupChange">
									<u-radio :customStyle="{ position: 'absolute', bottom: '36px',right: '4px'}"
										:key="photoIndex" :name="photoItem.name" @change="radioChange">
										<!-- <u-icon name="camera-fill" size="24" color="#4888f4" @click="openCamera" /> -->
									</u-radio>
								</u-radio-group>
								<text class="album-name">{{ photoItem.name }}</text>
							</u-grid-item>
						</u-grid>
					</u-collapse-item>
				</u-collapse>
			</view>
		</view>
		<u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png">
		</u-empty>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				keyword: '',
				currentIndex: -1, // 初始不显示预览
				radiovalue: '',
				originAlbums: [],
				albums: []
			};
		},
		onLoad() {
			// this.originAlbums = this.albums
			this.GetPhotoPage();
		},
		methods: {
			openCamera() {
				uni.chooseImage({
					count: 1, // 默认9，设置图片的数量
					sourceType: ['camera'], // 可选择的源类型，'album'从相册选择，'camera'使用相机，默认二者都有
					success: (res) => {
						// 成功选择图片后的回调
						console.log(res.tempFilePaths);
					},
					fail: (err) => {
						// 选择图片失败的回调
						console.log('选择图片失败：', err);
					}
				});
			},
			clear() {
				this.albums = this.originAlbums
			},
			blur(e) {
				this.albums = this.originAlbums.filter(item => {
					return item.name.includes(e)
				})
			},
			search(e) {

				this.albums = this.originAlbums.filter(item => {
					return item.name.includes(e)
				})
			},
			GetPhotoPage() {
				const params = {
					pageNo: 1,
					pageSize: 100
				}
				this.$store.dispatch('GetPhotoPage', params).then((res) => {
					console.log(res, '照片列表')
					// 按照日期分组照片
					const list = []
					const obj = res.groupList
					for (let key in obj) {
						console.log(key);
						console.log(obj[key]);
						this.albums.push({
							'date': key,
							'photos': obj[key]
						})
					}
					console.log(this.albums, 'this.albums')

				}).catch(err => {
					console.log('GetPhotoPage err', err)
				})
			},
			radioChange(n) {
				console.log('radioChange', n);
			},
			groupChange(n) {
				console.log('groupChange', n);
			},
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		padding: 10px;
		background-color: #fff;
		height: 100vh;

		.top {
			position: fixed;
			top: 0;
			width: 95%;
			z-index: 1;
			background: #fff;
		}

		.list {
			margin-top: 44px;
			height: calc(100% - 44px);
		}

		::v-deep .uicon-camera-fill {
			position: 'absolute';
			bottom: '60px';
			right: '0px';
		}

		.photo {
			width: 105px;
			height: 105px;
			object-fit: cover;
			border-radius: 6px;
			background-color: #fff;
			border: 1px solid #ddd;

		}

		.album-name {
			text-align: center;
			padding: 5px;
			font-size: 12px;
			color: #333;
			width: 100px;
			// background-color: #ddd;
			margin-bottom: 5px;
		}
	}
</style>