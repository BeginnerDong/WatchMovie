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
		indicatorDots: true,
		vertical: false,
		autoplay: true,
		circular: true,
		interval: 2000,
		duration: 1000,
		previousMargin: 0,
		nextMargin: 0,
		swiperIndex: 0,
		isFirstLoadAllStandard: ['getMainData', 'getMessageData', 'getHeartData'],
		messageData: [],
		is_show: false,
		is_play: false,
		submitData: {
			phone: '',
			wechat: ''
		},
		logData: [],
		heartData: [],
		is_show_notice:false
	},


	onLoad(options) {
		const self = this;
	
		if (options.order_no) {
			self.data.id = options.sku_id;
			self.data.order_no=options.order_no;
			self.data.user_no = options.user_no;
			self.getShareUserData()
		}else{
			self.data.id = options.id;
		}
		api.commonInit(self);
		self.getMainData();
		self.getUserInfoData();
		
	},

	getHeartData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			type: 1,
			relation_id: self.data.mainData.id,
			relation_table :'sku',
			user_type: 0
		};
		postData.getAfter = {
			user: {
				tableName: 'User',
				middleKey: 'user_no',
				key: 'user_no',
				searchItem: {
					status: 1,
				},
				condition: '='
			},
		};

		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.heartData.push.apply(self.data.heartData, res.info.data);
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getHeartData', self);
			self.setData({
				web_heartData: self.data.heartData,
			});
		};
		api.logGet(postData, callback);
	},

	getUserInfoData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no: wx.getStorageSync('info').user_no
		};
		postData.getAfter = {
			hasWatch: {
				tableName: 'Order',
				middleKey: 'user_no',
				key: 'user_no',
				searchItem: {
					status: 1,
					pay_status: 1,
					transport_status: 2,
					type: 1
				},
				condition: '='
			},
			OrderItem: {
				tableName: 'OrderItem',
				middleKey: 'user_no',
				key: 'user_no',
				condition: '=',
				searchItem: {
					status: 1,
					sku_id:self.data.id,
					pay_status:1
				},
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.userInfoData = res.info.data[0];
				self.data.submitData.phone = self.data.userInfoData.phone;
				self.data.submitData.wechat = self.data.userInfoData.wechat;
			};
			self.setData({
				web_submitData: self.data.submitData
			});
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
		};
		api.userInfoGet(postData, callback);
	},
	
	getShareUserData(){
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no:self.data.user_no,
			
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.solely_code == 100000) {
				self.data.shareUserData = res.info.data[0];
				self.data.is_show_notice = true;
				self.setData({
					web_shareUserData:self.data.shareUserData,
					is_show_notice: self.data.is_show_notice
				});
			}
		};
		api.commonUserGet(postData, callback);	
	},
	
	closeNotice(){
		const self = this;
		self.data.is_show_notice = false;
		self.setData({
			is_show_notice: self.data.is_show_notice
		});
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

	submitTwo() {
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
					is_show: self.data.is_show
				});
				api.showToast('完善成功', 'none');
			} else {
				api.showToast(res.msg, 'none')
			};
			self.getUserInfoData()
		};
		api.userInfoUpdate(postData, callback);
	},


	toDetail(e) {
		const self = this;
		self.data.index = api.getDataSet(e, 'index');

		if (self.data.userInfoData.phone == '' || self.data.userInfoData.wechat == '') {
			self.data.is_show = true;
		} else {
			if (self.data.messageData[self.data.index].log.length > 0) {
				api.pathTo('/pages/hisPage/hisPage?user_no=' + self.data.messageData[self.data.index].user_no, 'nav')
			} else if (self.data.userInfoData.deadline > 0) {
				api.pathTo('/pages/hisPage/hisPage?user_no=' + self.data.messageData[self.data.index].user_no, 'nav')
			} else {
				self.data.is_play = true;
				self.setData({
					is_play: self.data.is_play
				})
			}
		};
		self.setData({
			is_show: self.data.is_show
		})
	},

	close() {
		const self = this;
		self.data.is_show = false;
		self.data.is_play = false;
		self.setData({
			is_show: self.dat.is_show,
			is_play: self.data.is_play
		})
	},

	submitThree() {
		const self = this;
		api.buttonCanClick(self);
		if (parseInt(self.data.userInfoData.score) > 1) {
			const callback = (user, res) => {
				self.addLogTwo();
			};
			api.getAuthSetting(callback);
		} else {
			api.buttonCanClick(self, true)
			api.showToast('锦绣劵不足', 'none')
		};
	},



	addLogTwo(index) {
		const self = this;

		const postData = {};
		postData.data = {
			type: 2,
			relation_user: self.data.messageData[self.data.index].user_no,
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
				api.pathTo('/pages/hisPage/hisPage?user_no=' + self.data.messageData[self.data.index].user_no, 'nav')
			} else {
				api.showToast(res.msg, 'none', 1000)
			};
			self.close();
			self.data.messageData[self.data.index].log.push({
				status: 1,
				id: res.info.id
			});
			self.setData({
				web_messageData: self.data.messageData
			});
		};
		api.logAdd(postData, callback);
	},

	getMainData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			id: self.data.id
		};
		
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.mainData.product.description = self.data.mainData.product.description.split(',');
				self.data.mainData.end_time = api.timeto(self.data.mainData.end_time,'hm');
				self.data.mainData.start_time = api.timeto(self.data.mainData.start_time,'ymd-hm');
				self.data.mainData.product.content = api.wxParseReturn(res.info.data[0].product.content).nodes;
				self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
			}
			console.log('self.data.mainData',self.data.mainData)
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.getMessageData();
			self.getHeartData();
			self.setData({
				web_mainData: self.data.mainData,
			});
		};
		api.skuGet(postData, callback);
	},


	getMessageData() {
		const self = this;
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			relation_id: self.data.mainData.product.id,
			user_type: 0
		};
		postData.getAfter = {
			film: {
				tableName: 'Product',
				middleKey: 'relation_id',
				key: 'id',
				searchItem: {
					status: 1
				},
				condition: '='
			},
			user: {
				tableName: 'User',
				middleKey: 'user_no',
				key: 'user_no',
				searchItem: {
					status: 1
				},
				condition: '='
			},
			good: {
				tableName: 'Log',
				middleKey: 'id',
				key: 'relation_id',
				searchItem: {
					status: 1,
					type: 4
				},
				condition: '='
			},
			goodMe: {
				tableName: 'Log',
				middleKey: 'id',
				key: 'relation_id',
				searchItem: {
					type: 4,
					user_no: wx.getStorageSync('info').user_no
				},
				condition: '='
			},
			log: {
				tableName: 'Log',
				middleKey: 'user_no',
				key: 'relation_user',
				searchItem: {
					status: 1,
					type: 2
				},
				condition: '='
			},
			message: {
				tableName: 'Message',
				middleKey: 'id',
				key: 'relation_id',
				searchItem: {
					status: 1,
					type:2,
					user_type:0
				},
				condition: '='
			},
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.messageData.push.apply(self.data.messageData, res.info.data);
				if (self.data.messageData.length > 2) {
					self.data.messageData = self.data.messageData.splice(0, 2)
				}
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMessageData', self);
			self.setData({
				web_messageData: self.data.messageData,
			});
		};
		api.messageGet(postData, callback);
	},


	clickGood(e) {
		const self = this;
		api.buttonCanClick(self);
		var index = api.getDataSet(e, 'index');
		var item = self.data.messageData[index];
		self.addLog(index)
	},

	addLog(index) {
		const self = this;
		var item = self.data.messageData[index];
		const postData = {};
		postData.data = {
			type: 4,

			relation_id: self.data.messageData[index].id
		};

		postData.tokenFuncName = 'getProjectToken';
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.solely_code == 100000) {
				self.data.messageData[index].goodMe.push({
					status: 1,
					id: res.info.id
				});
				self.data.messageData[index].good.push({
					status: 1,
					id: res.info.id
				});
			} else {
				api.showToast(res.msg, 'none', 1000)
			};

			self.setData({
				web_messageData: self.data.messageData
			});
		};
		api.logAdd(postData, callback);
	},
	
	
	formIdAdd(e) {
		console.log(e)
	
		api.WxFormIdAdd(e.detail.formId, Date.parse(new Date()) / 1000 + 7 * 86400);
	},
	

	submit() {
		const self = this;
		api.buttonCanClick(self);
		if(self.data.user_no){
			if(self.data.mainData.behavior==1){
				if(self.data.shareUserData.info.gender==wx.getStorageSync('info').info.gender){
					api.buttonCanClick(self,true);
					api.showToast('性别不符哦');
					return
				}
			}else if(self.data.mainData.behavior==2){
				if(self.data.shareUserData.info.gender!=wx.getStorageSync('info').info.gender){
					api.buttonCanClick(self,true);
					api.showToast('性别不符哦');
					return
				}
			}
		};
		
		
		if(self.data.userInfoData.OrderItem.length>0){
			api.buttonCanClick(self,true);
			api.showToast('你已购买本场次');
			return
		}
		const callback = (user, res) => {
			self.addOrder();
		};
		api.getAuthSetting(callback);
	},


	addOrder() {
		const self = this;
		if (!self.data.order_id) {
			const postData = {
				tokenFuncName: 'getProjectToken',
				orderList: [{
					sku: [{
						id: self.data.mainData.id,
						count: 1
					}],
					type: 1,
				}],
				data:{}
			};
			console.log('addOrder', self.data.addressData)
			if (self.data.order_no) {
				postData.data.passage1 = self.data.order_no
			};
			
			
			
			const callback = (res) => {
				if (res && res.solely_code == 100000) {
					self.data.order_id = res.info.id
					self.pay();
				};
			};
			api.addOrder(postData, callback);
		} else {
			self.pay()
		}
	},


	pay() {
		const self = this;
		var order_id = self.data.order_id;
		const postData = {
			tokenFuncName: 'getProjectToken',
			searchItem: {
				id: order_id,
			},
			wxPay: {
				price: self.data.mainData.price
			}
		};
		const callback = (res) => {
			if (res.solely_code == 100000) {
				api.buttonCanClick(self, true);
				if (res.info) {
					const payCallback = (payData) => {
						if (payData == 1) {
							wx.showModal({
								title: '温馨提示',
								content: '您可在兑换中心以锦绣卷兑换零食饮料',
								cancelText: '取消',
								confirmText: '确认',
								success(res) {
									if (res.cancel) {
										
									} else if (res.confirm) {
										setTimeout(function() {
											api.pathTo('/pages/user/user', 'rela');
										}, 800)
									}
								}
							})
							
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

	intoMap() {
		const self = this;
		wx.getLocation({
			type: 'gcj02', //返回可以用于wx.openLocation的经纬度
			success: function(res) { //因为这里得到的是你当前位置的经纬度
				var latitude = res.latitude
				var longitude = res.longitude
				wx.openLocation({ //所以这里会显示你当前的位置
					// longitude: 109.045249,
					// latitude: 34.325841,
					longitude: parseFloat(self.data.mainData.longitude),
					latitude: parseFloat(self.data.mainData.latitude),
					name: self.data.mainData.passage1,
					address: self.data.mainData.address,
					scale: 28
				})
			}
		})
	},

	show() {
		const self = this;
		self.data.is_show = !self.data.is_show;
		self.setData({
			is_show: self.data.is_show
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
