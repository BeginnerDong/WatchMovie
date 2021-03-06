import {
	Api
} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {
	Token
} from '../../utils/token.js';


//index.js
//获取应用实例
//触摸开始的事件

Page({
	data: {
		is_show: false,
		heartData: [],
		mainData: [],
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
		isFirstLoadAllStandard: ['getHeartData', 'getHotData', 'userInfoGet', 'getMainData', 'getSliderData'],
		submitData: {
			birthday: '',
			birth_address: '',
			address: '',
			gender: '',
			email: '',
			phone: ''
		}
	},

	onLoad(options) {
		const self = this;
		console.log(options);
		if (options.user_no) {
			console.log(options);
			self.data.user_no = options.user_no;
			const token = new Token({
				parent_no: self.data.user_no
			});
			const callback = (res) => {
				self.getHeartData();
			};
			token.getProjectToken(callback, {
				refreshToken: true,
				parent_no: self.data.user_no
			})
		} else {
			const token = new Token({});
			const callback = (res) => {
				self.getHeartData();
			};
			token.getProjectToken(callback, {
				refreshToken: true
			})
		}
		api.commonInit(self);
		/* 		if(!wx.getStorageSync('token')){
					const token = new Token({});
					const callback = (res) =>{
							self.getHeartData();
					};
					token.getProjectToken(callback,{refreshToken:true})
				}else{
					self.getHeartData();
				} */

		self.getHotData();
		self.getMainData();

		self.userInfoGet();
		self.getSliderData()
	},

	show(e) {
		const self = this;
		self.data.is_show = false;
		self.setData({
			is_show: self.data.is_show
		})
	},

	getPhoneNumber(e) {
		const self = this;
		console.log('e', e);
		if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
			return
		};
		const postData = {
			appid: wx.getStorageSync('info').thirdApp.appid,
			tokenFuncName: 'getProjectToken',
			encryptedData: e.detail.encryptedData,
			iv: e.detail.iv
		};
		const callback = (res) => {
			if (res.solely_code == 100000) {
				self.data.submitData.phone = res.info.phoneNumber;
				console.log(res)
			}
			self.setData({
				web_submitData: self.data.submitData
			})
		}
		api.decryptWxInfo(postData, callback)
	},


	getSliderData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			title: '首页轮播图'
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.sliderData = res.info.data[0]
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getSliderData', self);
			self.setData({
				web_sliderData: self.data.sliderData,
			});
		};
		api.labelGet(postData, callback);
	},


	getHeartData() {
		const self = this;

		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			type: 1
		};
		postData.getAfter = {
			heart: {
				token: wx.getStorageSync('token'),
				tableName: 'Log',
				middleKey: 'id',
				key: 'relation_id',
				searchItem: {
					status: 1,
					type: 1,
					user_type: 0,
					relation_table: 'product'
				},
				condition: '=',
				compute: {
					num: ['count', 'count', {
						status: 1,
						type: 1,
						relation_table: 'product'
					}]
				}
			}
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
					self.data.heartData[i].end_time = api.timestampToTime(self.data.heartData[i].end_time);
					var percent = Math.ceil(self.data.heartData[i].heart.num + 100 / (self.data.heartData[i].stock + 100) * 100);
					percent = Math.round(percent / 10) * 10;
					if (percent == 0) {
						percent = 1;
					};
					self.data.heartData[i].heart_url = "/image/cardiac-" + percent + ".png"
				};
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
			stock: ['>', 0],
			on_shelf: 1
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

	bindBirthAddress(e) {
		const self = this;
		self.data.submitData.birth_address = e.detail.value[0] + e.detail.value[1] + e.detail.value[2];
		self.data.submitData.email = e.detail.value[0];
		self.setData({
			web_submitData: self.data.submitData
		})
		console.log(e)
	},

	bindAddress(e) {
		const self = this;
		self.data.submitData.address = e.detail.value[0] + e.detail.value[1] + e.detail.value[2];
		self.setData({
			web_submitData: self.data.submitData
		})
		console.log(e)
	},

	select(e) {
		const self = this;
		var num = api.getDataSet(e, 'num');
		self.data.submitData.gender = num;
		self.setData({
			web_gender: num
		})
	},

	userInfoGet() {

		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no: wx.getStorageSync('info').user_no
		};
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
		var newObject = api.cloneForm(self.data.submitData);
		delete newObject.phone;
		const pass = api.checkComplete(newObject);
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
		/* if(self.data.user_no){
			postData.saveAfter = [{
				tableName: 'FlowLog',
				FuncName: 'add',
				data: {
					count: 1,
					user_no: self.data.user_no,
					type: 3,
					thirdapp_id: 2,
					trade_info: '分享奖励'
				}
			}]
		}; */
		const callback = (data) => {
			api.buttonCanClick(self, true);
			if (data.solely_code == 100000) {
				self.data.is_show = false;
				self.setData({
					is_show: self.data.is_show
				});
			} else {
				api.showToast(res.msg, 'none')
			};
		};
		api.userInfoUpdate(postData, callback);
	},


	getMainData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self)
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
		};
		postData.getBefore = {
			caseData: {
				tableName: 'Label',
				searchItem: {
					title: ['=', ['那些趣事']],
				},
				middleKey: 'menu_id',
				key: 'id',
				condition: 'in',
			}
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
			} else {
				self.data.isLoadAll = true;
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
		};
		api.articleGet(postData, callback);
	},

	onReachBottom() {
		const self = this;
		if (!self.data.isLoadAll && self.data.buttonCanClick) {
			self.data.paginate.currentPage++;
			self.getMainData();
		};
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
