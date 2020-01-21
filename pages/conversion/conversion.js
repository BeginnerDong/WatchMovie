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
		mainData: [],
		isFirstLoadAllStandard: ['getMainData','getUserInfoData'],
		num: 1,
		is_show: false
	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.setData({
			web_num: self.data.num
		});
		self.getMainData();
		self.getUserInfoData()
	},

	show(e) {
		const self = this;
		var index = api.getDataSet(e, 'index');
		self.data.url = self.data.mainData[index].url;
		self.data.is_show = true;
		self.setData({
			web_url: self.data.url,
			is_show: self.data.is_show
		})
	},

	close() {
		const self = this;
		self.data.is_show = false;
		self.setData({
			is_show: self.data.is_show
		})
	},


	getUserInfoData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no:wx.getStorageSync('info').user_no
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.userInfoData = res.info.data[0]
			} 
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getUserInfoData', self);
			self.setData({
				web_userInfoData: self.data.userInfoData,
			});
		};
		api.userInfoGet(postData, callback);
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
			type: 3,
			
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
				for (var i = 0; i < self.data.mainData.length; i++) {
					self.data.mainData[i].count = 1;
					self.data.mainData[i].price = parseInt(self.data.mainData[i].price)
				}
			} else {
				self.data.isLoadAll = true;
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
		};
		api.productGet(postData, callback);
	},

	getMainTwoData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self)
		};
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			type: 3,
			pay_status: 1,
			user_no:wx.getStorageSync('info').user_no
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
			} else {
				self.data.isLoadAll = true;
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
		};
		api.orderGet(postData, callback);
	},

	changeType(e) {
		const self = this;
		api.buttonCanClick(self);
		var num = api.getDataSet(e, 'num');
		if (num != self.data.num) {
			self.data.num = num;
			if (num == 1) {
				self.getMainData(true)
			} else if (num == 2) {
				self.getMainTwoData(true)
			}
		};
		self.setData({
			web_num: self.data.num
		})
	},

	counter(e) {
		const self = this;
		var index = api.getDataSet(e, 'index');
		console.log(index)
		if (api.getDataSet(e, 'type') == '+') {
			self.data.mainData[index].count++;
		} else if (api.getDataSet(e, 'type') == '-' && self.data.mainData[index].count > '1') {
			self.data.mainData[index].count--;
		}
		self.setData({
			web_mainData: self.data.mainData
		});
	},


	submit(e) {
		const self = this;
		wx.showModal({
			title: '确认兑换',
			content: '确认兑换此商品吗（仅限观影当天核销）',
			cancelText: '取消',
			confirmText: '确认',
			success(res) {
				if (res.cancel) {
					
				} else if (res.confirm) {
					if(self.data.userInfoData.count==0){
						api.showToast('您已兑换过了或尚未购买影票','none')
						return
					};
					var index = api.getDataSet(e, 'index');
					api.buttonCanClick(self);
					const callback = (user, res) => {
						self.addOrder(index);
					};
					api.getAuthSetting(callback);
				}
			}
		})
		
	},


	addOrder(index) {
		const self = this;
		if (!self.data.order_id) {
			const postData = {
				tokenFuncName: 'getProjectToken',
				orderList: [{
					product: [{
						id: self.data.mainData[index].id,
						count: self.data.mainData[index].count
					}],
					type: 3,
				}]
			};
			console.log('addOrder', self.data.addressData)

			const callback = (res) => {
				if (res && res.solely_code == 100000) {
					self.data.order_id = res.info.id
					self.pay(index);
				};
			};
			api.addOrder(postData, callback);
		} else {
			self.pay(index)
		}
	},


	pay(index) {
		const self = this;
		var order_id = self.data.order_id;
		const postData = {
			tokenFuncName: 'getProjectToken',
			searchItem: {
				id: order_id,
			},
			score: self.data.mainData[index].price * self.data.mainData[index].count
		};
		postData.payAfter = [
			{
				tableName: 'UserInfo',
				FuncName: 'update',
				data: {
					count: self.data.userInfoData.count-1,
				},
				searchItem:{
					user_no:wx.getStorageSync('info').user_no
				}
			}
		];
		const callback = (res) => {
			if (res.solely_code == 100000) {
				api.buttonCanClick(self, true);
				api.showToast('兑换成功', 'none')
				if (res.info) {
					const payCallback = (payData) => {
						if (payData == 1) {
							api.showToast('兑换成功', 'none')
						};
					};
					api.realPay(res.info, payCallback);
				}
			} else {
				api.buttonCanClick(self, true);
				api.showToast(res.msg, 'none')
			}
		};
		api.pay(postData, callback);
	},

	onReachBottom() {
		const self = this;
		if (!self.data.isLoadAll && self.data.buttonCanClick) {
			self.data.paginate.currentPage++;
			self.getMainData();
		};
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
