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
		is_play: false,
		isFirstLoadAllStandard: ['getSeatData', 'getUserInfoData'],
		seatData: [],
		checkData: {},
		submitData:{
			phone:'',
			wechat:''
		}
	},

	show(e) {
		const self = this;
		self.data.is_show = !self.data.is_show;
		self.setData({
			is_show: self.data.is_show
		})
	},
	play(e) {
		const self = this;
		self.data.is_play = !self.data.is_play;
		self.setData({
			is_play: self.data.is_play
		})
	},
	onLoad: function(options) {
		const self = this;
		api.commonInit(self);
		if (options.art_id && options.sku_id) {
			self.data.art_id = options.art_id;
			self.data.sku_id = options.sku_id;
			self.data.discount = options.discount;
			self.data.standard = options.standard;
			self.getSeatData();
			self.getUserInfoData()
		} else {
			api.showToast('数据传递错误', 'none', 2000, function() {
				setTimeout(function() {
					wx.navigateBack({
						delta: 1
					})
				}, 2000)
			})
		}
		self.setData({
			web_standard:self.data.standard,
			web_discount:self.data.discount
		})
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
	
	close() {
		const self = this;
		self.data.is_show = false;
		self.data.is_play = false;
		self.setData({
			is_show: self.data.is_show,
			is_play: self.data.is_play
		})
	},
	
	userInfoUpdate() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.data = {};
		postData.data = api.cloneForm(self.data.submitData);
		postData.data.behavior = 0;
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

	getUserInfoData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no: wx.getStorageSync('info').user_no
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
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getUserInfoData', self);
		};
		api.userInfoGet(postData, callback);
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
			relation_user: self.data.checkData.user_no,
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
				api.pathTo('/pages/hisPage/hisPage?user_no=' + self.data.checkData.user_no, 'nav')
			} else {
				api.showToast(res.msg, 'none', 1000)
			};
			self.close();
			self.data.checkData.log.push({
				status: 1,
				id: res.info.id
			});

		};
		api.logAdd(postData, callback);
	},

	check(e) {
		const self = this;

		var item = api.getDataSet(e, 'item');
		if (item) {
			
			self.data.checkData = item;
			if (self.data.checkData.user_no==wx.getStorageSync('info').user_no) {
				api.pathTo('/pages/hisPage/hisPage?user_no=' + self.data.checkData.user_no, 'nav')
				return
			};
			if(self.data.userInfoData.behavior==0){
				api.showToast('您的资料审核中','none');
				return
			};
			if(self.data.userInfoData.behavior==-1){
				self.data.is_show = true;
				self.setData({
					is_show: self.data.is_show
				});
				return
			};
			if (self.data.checkData.UserInfo[0].behavior == 0) {
				api.showToast('用户资料审核中', 'none')
			} else {
				if (self.data.checkData.log.length > 0) {
					api.pathTo('/pages/hisPage/hisPage?user_no=' + self.data.checkData.user_no, 'nav')
				} else if (self.data.userInfoData.deadline > 0) {
					api.pathTo('/pages/hisPage/hisPage?user_no=' + self.data.checkData.user_no, 'nav')
				} else {
					self.data.is_play = true;
					self.setData({
						is_play: self.data.is_play
					})
				}
			}
		}
		console.log('self.data.checkData', self.data.checkData);
	},

	getSeatData() {
		const self = this;
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			art_id: self.data.art_id
		};
		postData.order = {
			line: 'asc'
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				//self.data.seatData.push.apply(self.data.seatData, res.info.data);
				console.log('self.data.seatData', self.data.seatData);
				self.data.orginSeatData = res.info.data;
			};
			console.log('self.data.orginSeatData', self.data.orginSeatData)
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getSeatData', self);
			self.initOrderData();
		};
		api.SeatTableGet(postData, callback);

	},

	initOrderData() {
		const self = this;
		self.data.hasOne = false;
		self.data.orderData = [];
		const postData = {};
		postData.searchItem = {
			sku_id: self.data.sku_id,
			user_type: 0
		};
		postData.tokenFuncName = 'getProjectToken';
		postData.getAfter = {
			Order: {
				tableName: 'Order',
				middleKey: 'order_no',
				key: 'order_no',
				condition: '=',
				searchItem: {
					status: 1,
					user_type: 0
				},
			},
			UserInfo: {
				tableName: 'UserInfo',
				middleKey: 'user_no',
				key: 'user_no',
				condition: '=',
				searchItem: {
					status: 1
				},
			},
			log: {
				tableName: 'Log',
				middleKey: 'user_no',
				key: 'relation_user',
				condition: '=',
				searchItem: {
					status: 1,
					type: 2,
					user_no: wx.getStorageSync('info').user_no
				},
			},
		};
		var callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.orderData = res.info.data;
				self.data.seatData = [];
				self.data.seatData = self.computeSeatMap(self.data.orginSeatData);
				console.log('self.data.seatData', self.data.seatData)
				self.setData({
					web_seatData: self.data.seatData,
				});
			};
		};
		api.orderItemGet(postData, callback);


	},

	computeSeatMap(data) {
		const self = this;
		var max = 0;
		var seatData = [];
		for (var i = 0; i < data.length; i++) {
			var seat = [];
			var sepeate = data[i].blank.split(',');
			if (data[i].num > max) {
				max = data[i].num
			};
			var forNum = sepeate.length + data[i].num;
			var num = 0;
			for (var j = 0; j < forNum; j++) {
				if (sepeate.indexOf((j + 1).toString()) == -1) {
					var findOrder = self.findSeat(data[i].line, (j - num + 1));
					if (findOrder && findOrder.order_no == self.data.order_no) {
						self.data.hasOne = true;
					};
					seat.push({
						seatNum: j - num + 1,
						seat: data[i].line + '-' + (j + 1),
						findOrder: findOrder
					});
				} else {
					num++;
					seat.push({
						seatNum: j + 1,
						seat: 0
					});
				};
			};
			seatData.push({
				line: data[i].line,
				seat: seat
			});
		};

		return seatData;
	},

	findSeat(standard, discount) {
		const self = this;
		var res = false;
		for (var i = 0; i < self.data.orderData.length; i++) {
			if (self.data.orderData[i]['Order'][0].standard == standard && self.data.orderData[i]['Order'][0].discount ==
				discount) {
				res = self.data.orderData[i];
			};
		};
		return res;
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
