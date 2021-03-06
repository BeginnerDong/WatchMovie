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

		isFirstLoadAllStandard: ['getMainData']
	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.data.order_no = options.order_no;
		if (self.data.order_no) {
			self.getMainData()
		} else {
			api.showToast('二维码无效', 'none', 2000, function() {
				setTimeout(function() {
					wx.navigateBack({
						delta: 1
					})
				}, 2000)
			})
		}
	},


	getMainData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = {
			order_no: self.data.order_no,
			user_type: 0
		};
		postData.searchItem.type = 1;
		postData.searchItem.pay_status = 1;
		const callback = (res) => {
			console.log('222', self.data.show)
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.mainData.products[0].snap_product.end_time = api.timeto(self.data.mainData.products[0].snap_product.end_time,
					'hm');
				self.data.mainData.products[0].snap_product.start_time = api.timeto(self.data.mainData.products[0].snap_product.start_time,
					'ymd-hm');
				self.setData({
					web_mainData: self.data.mainData,
				});
			} else {
				api.showToast('二维码无效', 'none', 2000, function() {
					setTimeout(function() {
						wx.navigateBack({
							delta: 1
						})
					}, 2000)
				})
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);

		};
		api.orderGet(postData, callback);
	},


	orderUpdate() {
		const self = this;
		wx.showModal({
			title: '确认核销',
			content: '确认核销此二维码吗',
			cancelText: '取消',
			confirmText: '确认',
			success(res) {
				if (res.cancel) {

				} else if (res.confirm) {
					api.buttonCanClick(self);
					if (self.data.mainData.products[0].snap_product.behavior == 1 || self.data.mainData.products[0].snap_product.behavior ==
						2) {
						if (self.data.mainData.passage1 == '') {
							api.buttonCanClick(self, true);
							api.showToast('还未结伴成功', 'none');
							return
						};
						if (self.data.mainData.discount == 0) {
							api.buttonCanClick(self, true);
							api.showToast('还未分配座位', 'none');
							return
						}
					};
					const postData = {};
					postData.tokenFuncName = 'getThreeToken';
					postData.searchItem = {
						order_no: self.data.order_no,
						user_no: self.data.mainData.user_no,
						user_type: 0
					};
					postData.data = {
						transport_status: 2,
						order_step: 3
					};
					const callback = (res) => {
						api.buttonCanClick(self, true);
						if (res.solely_code == 100000) {
							api.showToast('核销成功', 'none', 2000, function() {
								setTimeout(function() {
									wx.navigateBack({
										delta: 1
									})
								}, 2000)
							})
						} else {
							api.showToast(res.msg, 'none')
						}
						api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
						self.setData({
							web_show: self.data.show,
						});
					};
					api.orderUpdate(postData, callback);
				}
			}
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
