//logs.js
import {
	Api
} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {
	Token
} from '../../utils/token.js';
const token = new Token();
Page({
	data: {
		mainData: [],
		submitData: {
			mainImg: [],
			passage1: '',
			birthday: '',
			birth_address: '',
			constellation: '',
			education: '',
			school: '',
			movie_label: [],
			hobby_label: [],
		},
		constellationData: ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座', ],
		educationData: ['硕士', '本科', '大专', '高中', '初中', '小学'],
		urlSet: [],

		index: 0,
		isFirstLoadAllStandard: ['getMainData', 'getMovieTipData', 'getHobbyTipData'],
	},



	onLoad() {
		const self = this;
		api.commonInit(self);
		self.getMainData();
		self.getMovieTipData();
		self.getHobbyTipData()
	},

	educationDataChange(e) {
		const self = this;
		self.data.submitData.education = self.data.educationData[e.detail.value];
		self.setData({
			web_indexE: e.detail.value,
			web_submitData: self.data.submitData
		})
		console.log(e)
	},

	constellationDataChange(e) {
		const self = this;
		self.data.submitData.constellation = self.data.constellationData[e.detail.value];
		self.setData({
			web_indexC: e.detail.value,
			web_submitData: self.data.submitData
		})
		console.log(e)
	},

	bindDateChange(e) {
		const self = this;
		self.data.submitData.birthday = e.detail.value;
		self.setData({
			web_submitData: self.data.submitData
		})
		console.log(e)
	},


	changeBind(e) {
		const self = this;
		if (api.getDataSet(e, 'value')) {
			self.data.submitData[api.getDataSet(e, 'key')] = api.getDataSet(e, 'value');
		} else {
			api.fillChange(e, self, 'submitData');
		};
		self.setData({
			web_submitData: self.data.submitData,
		});
		console.log(self.data.submitData)
	},





	getMainData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no: wx.getStorageSync('info').user_no
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.submitData.mainImg = self.data.mainData.mainImg;
				self.data.submitData.passage1 = self.data.mainData.passage1;
				self.data.submitData.birthday = self.data.mainData.birthday;
				self.data.submitData.birth_address = self.data.mainData.birth_address;
				self.data.submitData.address = self.data.mainData.address;
				self.data.submitData.constellation = self.data.mainData.constellation;
				self.data.submitData.education = self.data.mainData.education;
				self.data.submitData.school = self.data.mainData.school;
				self.data.submitData.movie_label = self.data.mainData.movie_label;
				self.data.submitData.hobby_label = self.data.mainData.hobby_label;
				for (var i = 0; i < self.data.constellationData.length; i++) {
					if (self.data.mainData.constellation == self.data.constellationData[i]) {
						self.setData({
							web_indexC: i
						})
					}
				};
				for (var i = 0; i < self.data.constellationData.length; i++) {
					if (self.data.mainData.education == self.data.educationData[i]) {
						self.setData({
							web_indexE: i
						})
					}
				};
			};
			console.log(self.data.mainData)
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_submitData: self.data.submitData,
				web_mainData: self.data.mainData,
			});
		};
		api.userInfoGet(postData, callback);
	},

	getMovieTipData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			title: '观影标签'
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.movieTipData = res.info.data[0],
					self.data.movieTipData.description = self.data.movieTipData.description.split(',')
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMovieTipData', self);
			self.setData({
				web_movieTipData: self.data.movieTipData,
			});
		};
		api.labelGet(postData, callback);
	},

	getHobbyTipData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			title: '爱好标签'
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.hobbyData = res.info.data[0],
					self.data.hobbyData.description = self.data.hobbyData.description.split(',')
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getHobbyTipData', self);
			self.setData({
				web_hobbyData: self.data.hobbyData,
			});
		};
		api.labelGet(postData, callback);
	},

	selectMovie(e) {
		const self = this;
		var index = api.getDataSet(e,'index');
		console.log('e', e);
		
		var name = self.data.movieTipData.description[index];
		console.log('name',name)
		console.log('name',self.data.submitData)
		var position = self.data.submitData.movie_label.indexOf(name);
		if (position >= 0) {
			self.data.submitData.movie_label.splice(position, 1);
		} else {
			self.data.submitData.movie_label.push(name);
		};
		self.setData({
			web_submitData:self.data.submitData
		})
	},

	selectHobby(e) {
		const self = this;
		var index = api.getDataSet(e,'index');
		console.log('index', index);
		var name = self.data.hobbyData.description[index];
		var position = self.data.submitData.hobby_label.indexOf(name);
		if (position >= 0) {
			self.data.submitData.hobby_label.splice(position, 1);
		} else {
			self.data.submitData.hobby_label.push(name);
		};
		self.setData({
			web_submitData:self.data.submitData
		})
	},

	submit() {
		const self = this;
		api.buttonCanClick(self);
		var phone = self.data.submitData.phone;
		const pass = api.checkComplete(self.data.submitData);
		console.log('pass', pass);
		console.log('self.data.submitData', self.data.submitData)
		if (pass) {
			const callback = (user, res) => {
				self.userInfoUpdate();
			};
			api.getAuthSetting(callback);
		} else {
			api.buttonCanClick(self, true)
			api.showToast('请补全信息', 'none')
		};
	},

	upLoadImg() {
		const self = this;
		if (self.data.submitData.mainImg.length > 2) {
			api.showToast('仅限3张', 'fail');
			return;
		};
		wx.showLoading({
			mask: true,
			title: '图片上传中',
		});
		const callback = (res) => {
			console.log('res', res)
			if (res.solely_code == 100000) {

				self.data.submitData.mainImg.push({
					url: res.info.url
				})
				self.setData({
					web_submitData: self.data.submitData
				});
				wx.hideLoading()
			} else {
				api.showToast('网络故障', 'none')
			}
		};

		wx.chooseImage({
			count: 1,
			success: function(res) {
				console.log(res);
				var tempFilePaths = res.tempFilePaths;
				console.log(callback)
				api.uploadFile(tempFilePaths[0], 'file', {
					tokenFuncName: 'getProjectToken'
				}, callback)
			},
			fail: function(err) {
				wx.hideLoading();
			}
		})
	},

	previewImg(e) {
		const self = this;
		var index = e.currentTarget.dataset.index;
		if (self.data.submitData.mainImg.length > 0) {
			for (var i = 0; i < self.data.submitData.mainImg.length; i++) {
				self.data.urlSet.push(self.data.submitData.mainImg[i].url);
			}
		}
		console.log('self.data.submitData.mainImg', self.data.submitData.mainImg)
		wx.previewImage({
			current: self.data.submitData.mainImg[index].url,
			urls: self.data.urlSet,
			success: function(res) {},
			fail: function(res) {},
			complete: function(res) {},
		})
	},


	delete(e) {
		const self = this;
		var index = api.getDataSet(e, 'index');
		console.log('deleteImg', index)
		self.data.submitData.mainImg.splice(index, 1);
		self.setData({
			web_submitData: self.data.submitData
		})
	},

	userInfoUpdate() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		if (!wx.getStorageSync('info') || !wx.getStorageSync('info').headImgUrl) {
			postData.refreshToken = true;
		};
		postData.data = {};
		postData.data = api.cloneForm(self.data.submitData);
		const callback = (data) => {
			if (data.solely_code == 100000) {
				api.showToast('完善成功', 'none', 1000)
				setTimeout(function() {
					wx.navigateBack({
						delta: 1
					})
				}, 1000);
			} else {
				api.showToast(data.msg, 'none', 1000)
			}

		};
		api.userInfoUpdate(postData, callback);
	},

	
	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	}
	
})
