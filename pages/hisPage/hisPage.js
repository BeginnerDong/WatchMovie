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
		autoplay: true,
		duration: 1000,
		circular: true,
		vertical: false,
		interval: 3000,
		mainData: {},
		isFirstLoadAllStandard: ['getMainData', 'getMeData']
	},


	onLoad(options) {
		const self = this;
		self.data.user_no = options.user_no;
		self.getMainData();
		self.getMeData()
	},

	onShow() {

	},

	submit() {
		const self = this;
		
		wx.showModal({
			title: '确认支付',
			content: '确认消耗1个锦绣券查看更多吗' ,
			cancelText: '取消',
			confirmText: '确认',
			success(res) {
				if (res.cancel) {
					
				} else if (res.confirm) {
					api.buttonCanClick(self);
					if (parseInt(self.data.meData.score) >= 1) {
						const callback = (user, res) => {
							self.addLogTwo();
						};
						api.getAuthSetting(callback);
					} else {
						api.buttonCanClick(self, true)
						api.showToast('锦绣劵不足', 'none')
					};
				}
			}
		})
		
	},

	addLogTwo(index) {
		const self = this;

		const postData = {};
		postData.data = {
			type: 2,
			relation_user: self.data.user_no,
		};
		postData.tokenFuncName = 'getProjectToken';
		postData.saveAfter = [{
			tableName: 'FlowLog',
			FuncName: 'add',
			data: {
				count: -1,
				user_no: wx.getStorageSync('info').user_no,
				type: 3,
				thirdapp_id: 2,
				trade_info: '翻牌子'
			}
		}]
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.solely_code == 100000) {
				self.getMainData()
			} else {
				api.showToast(res.msg, 'none', 1000)
			};
		};
		api.logAdd(postData, callback);
	},

	getMainData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no: self.data.user_no,
			user_type: 0
		};
		postData.getAfter = {
			message: {
				tableName: 'Message',
				middleKey: 'user_no',
				key: 'user_no',
				searchItem: {
					status: 1,
					type: 1,
					mainImg: ['not in', []]
				},
				condition: '='
			},
			log: {
				tableName: 'Log',
				middleKey: 'user_no',
				key: 'relation_user',
				searchItem: {
					user_no:wx.getStorageSync('info').user_no
				},
				condition: '='
			}
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.mainData.info.birthday = self.data.mainData.info.birthday.substring(2, 4);
			};
			self.setData({
				web_mainData: self.data.mainData
			})
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
		};
		api.commonUserGet(postData, callback);
	},

	getMeData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no:wx.getStorageSync('info').user_no
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.meData = res.info.data[0];
			};
			self.setData({
				web_meData: self.data.meData
			})
			console.log('self.data.meData', self.data.meData)
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMeData', self);
		};
		api.userInfoGet(postData, callback);
	},

	onShareAppMessage() {
		const self = this;
		return {
			title: '锦绣五月',
			path: 'pages/index/index',
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

	intoPathRedirect(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'redi');
	},

	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	}

})
