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
		mainData:[],
		isFirstLoadAllStandard:['getMainData']

	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.getMainData();
	},



	getMainData() {
		const self = this;
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			type: 2
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
		api.productGet(postData, callback);
	},

	
	submit(e) {
		const self = this;
		var index = api.getDataSet(e,'index');
		api.buttonCanClick(self);
		const callback = (user, res) => {
			self.addOrder(index);
		};
		api.getAuthSetting(callback);
	},
	
	
	addOrder(index) {
		const self = this;
		if (!self.data.order_id) {
			const postData = {
				tokenFuncName: 'getProjectToken',
				orderList: [{
					product: [{
							id: self.data.mainData[index].id,
							count: 1
						}],
					type: 2,
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
			wxPay: {
				price: self.data.mainData[index].price
			}
		};
		postData.payAfter = [
			{
				tableName: 'FlowLog',
				FuncName: 'add',
				data: {
					count: self.data.mainData[index].balance,
					trade_info: '购买锦绣券',
					user_no: wx.getStorageSync('info').user_no,
					type: 3,
					thirdapp_id: 2,
				},
			}
		];
		const callback = (res) => {
			if (res.solely_code == 100000) {
				api.buttonCanClick(self, true);
				if (res.info) {
					const payCallback = (payData) => {
						if (payData == 1) {
							setTimeout(function() {
								api.pathTo('/pages/user/user', 'rela');
							}, 800)
						};
					};
					api.realPay(res.info, payCallback);
				}
			} else {
				api.showToast('支付失败', 'none')
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
