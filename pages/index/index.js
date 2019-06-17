import {
	Api
} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {
	Token
} from '../../utils/token.js';
const token = new Token();

//index.js
//获取应用实例
//触摸开始的事件

Page({
	data: {
		is_show: false,
		heartData: [],
		hotData: [],
		indicatorDots: false,
		vertical: false,
		autoplay: false,
		circular: true,
		interval: 2000,
		duration: 1000,
		previousMargin: 60,
		nextMargin: 60,
		swiperIndex: 0,
		isFirstLoadAllStandard: ['getHeartData', 'getHotData', 'userInfoGet'],
		submitData: {
			birthday: '',
			birth_address: '',
			address: '',
		}
	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.getHeartData();
		self.getHotData();
		self.userInfoGet();
	},

	show(e) {
		const self = this;
		self.data.is_show = false;
		self.setData({
			is_show: self.data.is_show
		})
	},


	getHeartData() {
		const self = this;
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			type: 1
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.heartData.push.apply(self.data.heartData, res.info.data);
				if (self.data.heartData.length > 2) {
					self.data.heartData = self.data.heartData.splice(0, 2)
				};
				for (var i = 0; i < self.data.heartData.length; i++) {
					self.data.heartData[i].description = self.data.heartData[i].description.split(',');
					self.data.heartData[i].end_time = api.timestampToTime(self.data.heartData[i].end_time)
				}
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getHeartData', self);
			self.setData({
				web_heartData: self.data.heartData,
			});
		};
		api.productGet(postData, callback);
	},

	getHotData() {
		const self = this;
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.hotData.push.apply(self.data.hotData, res.info.data);
				if (self.data.hotData.length > 3) {
					self.data.hotData = self.data.hotData.splice(0, 3)
				};
				for (var i = 0; i < self.data.hotData.length; i++) {
					self.data.hotData[i].product.description = self.data.hotData[i].product.description.split(',');
					self.data.hotData[i].product.end_time = api.timestampToTime(self.data.hotData[i].product.end_time)
				}
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getHotData', self);
			self.setData({
				web_hotData: self.data.hotData,
			});
		};
		api.skuGet(postData, callback);
	},
	
	select(e){
		const self = this;
		var num = api.getDataSet(e,'num');
		self.data.submitData.gender = num;
		self.setData({
			web_gender:num
		})
	},

	userInfoGet() {

		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.userInfoData = res.info.data[0];
				if (self.data.userInfoData.birthday == '') {
					self.data.is_show = true;
					self.setData({
						is_show: self.data.is_show
					})
				}
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'userInfoGet', self);
		};
		api.userInfoGet(postData, callback);
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

	submit() {
		const self = this;
		api.buttonCanClick(self);
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


	userInfoUpdate() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.data = {};
		postData.data = api.cloneForm(self.data.submitData);
		const callback = (data) => {
			api.buttonCanClick(self, true);
			if (data.solely_code == 100000) {
				self.data.is_show = false;
				self.setData({
					is_show:self.data.is_show
				});
			} else {
				api.showToast(res.msg, 'none')
			};
		};
		api.userInfoUpdate(postData, callback);
	},

	swiperChange(e) {
		this.setData({
			swiperIndex: e.detail.current
		})
	},

	intoPathRedirect(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'redi');
	},
	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	}
})
