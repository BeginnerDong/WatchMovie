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
		isFirstLoadAllStandard: ['getMainData'],
		searchItem: {
			transport_status: 0
		},
		num: 1,
		is_show:false,
		url:''
	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.setData({
			web_num: self.data.num
		});
		self.getMainData();
	},

	show(e){
		const self = this;
		var index = api.getDataSet(e,'index');
		self.data.url = self.data.mainData[index].url;
		console.log('self.data.url',self.data.mainData[index].url)
		self.data.is_show = true;
		self.setData({
			web_url:self.data.url,
			is_show:self.data.is_show
		})
	},
	
	close(){
		const self = this;
		self.data.is_show = false;
		self.setData({
			is_show:self.data.is_show
		})
	},

	getMainData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self)
		};
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = api.cloneForm(self.data.searchItem);
		postData.searchItem.type = 1;
		postData.searchItem.pay_status = 1;
/* 		postData.searchItem.user_no = wx.getStorageSync('info').user_no;
		postData.getAfter = {
			relation_order: {
				tableName: 'Order',
				middleKey: 'order_no',
				key: 'passage1',
				searchItem: {
					status: 1,
					pay_status:1,
					user_no:['not in',[wx.getStorageSync('info').user_no]]
				},
				condition: '='
			},
		}; */
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
				for (var i = 0; i < self.data.mainData.length; i++) {
					self.data.mainData[i].products[0].snap_product.product.description = self.data.mainData[i].products[0].snap_product
						.product.description.split(',');
				}
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

	onShareAppMessage(e) {
		const self = this;
		var index = api.getDataSet(e,'index');
		return {
			title: '锦绣五月',
			path: 'pages/FilmDetails/FilmDetails?order_no=' + self.data.mainData[index].order_no,
			success: function(res) {
				console.log(res);
				console.log(parentNo)
				if (res.errMsg == 'shareAppMessage:ok') {
					console.log('分享成功')
					if (self.data.shareBtn) {
						if (res.hasOwnProperty('shareTickets')) {
							console.log(res.shareTickets[0]);
							self.data.isshare = 1;
						} else {
							self.data.isshare = 0;
						}
					}
				} else {
					wx.showToast({
						title: '分享失败',
					})
					self.data.isshare = 0;
				}
			},
			fail: function(res) {
				console.log(res)
			}
		}
	},


	changeType(e) {
		const self = this;
		api.buttonCanClick(self);
		var num = api.getDataSet(e, 'num');
		if (num != self.data.num) {
			self.data.num = num;
			if (num == 1) {
				self.data.searchItem.transport_status = 0;
			} else if (num == 2) {
				self.data.searchItem.transport_status = 2;
			}
		};
		self.getMainData(true);
		self.setData({
			web_num: self.data.num
		})
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
