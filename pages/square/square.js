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
		submitData: {
			title: ''
		},
		searchItem: {
			thirdapp_id: 2,
			type: 1,
			user_type: 0
		},
		sForm: {
			phone: '',
			wechat: ''
		},
		is_show: false,
		is_play: false,
	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.getUserInfoData()
	},

	onShow() {
		const self = this;
		self.getMainData(true);
	},
	
	intoCommentDetails(e){
		const self = this;
		var index = api.getDataSet(e,'index');
		console.log(index)
		if(self.data.mainData[index].relation.length==0){
			
			api.showToast('您没有观看此电影','none')
		}else{
			api.pathTo(api.getDataSet(e, 'path'), 'nav');
		}
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
			}
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

	toDetail(e) {
		const self = this;
		self.data.index = api.getDataSet(e, 'index');
		if (self.data.mainData[self.data.index].user_no==wx.getStorageSync('info').user_no) {
			api.pathTo('/pages/hisPage/hisPage?user_no=' + self.data.mainData[self.data.index].user_no, 'nav')
			return
		};
		console.log('111')
		if (self.data.userInfoData.phone == '' || self.data.userInfoData.wechat == '') {
			self.data.is_show = true;
			self.setData({
				is_show: self.data.is_show
			})
			console.log('222')
		} else {
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
			if(self.data.mainData[self.data.index].user[0].info.behavior==0){
				api.showToast('对方资料审核中','none');
				return
			};
			if (self.data.mainData[self.data.index].log.length > 0) {
				api.pathTo('/pages/hisPage/hisPage?user_no=' + self.data.mainData[self.data.index].user_no, 'nav')
			} else if (self.data.userInfoData.deadline > 0) {
				api.pathTo('/pages/hisPage/hisPage?user_no=' + self.data.mainData[self.data.index].user_no, 'nav')
			} else {
				self.data.is_play = true;
				self.setData({
					is_play: self.data.is_play
				})
			}
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

	submitThree() {
		const self = this;
		api.buttonCanClick(self);
		if (parseInt(self.data.userInfoData.score) >= 1) {
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
			relation_user: self.data.mainData[self.data.index].user_no,
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
				api.pathTo('/pages/hisPage/hisPage?user_no=' + self.data.mainData[self.data.index].user_no, 'nav')
			} else {
				api.showToast(res.msg, 'none', 1000)
			};
			self.close();
			self.data.mainData[self.data.index].log.push({
				status: 1,
				id: res.info.id
			});
			self.setData({
				web_mainData: self.data.mainData
			});
		};
		api.logAdd(postData, callback);
	},

	submitTwo() {
		const self = this;
		api.buttonCanClick(self);
		var phone = self.data.sForm.phone;
		const pass = api.checkComplete(self.data.sForm);
		console.log('pass', pass);
		console.log('self.data.sForm', self.data.sForm)
		if (pass) {
			if(phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)){
			  api.showToast('手机格式不正确','fail')
			}else{
				const callback = (user, res) => {
					self.userInfoUpdate();
				};
				api.getAuthSetting(callback);
			}
		
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
		postData.data = api.cloneForm(self.data.sForm);
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

	changeBindTwo(e) {
		const self = this;
		api.fillChange(e, self, 'sForm');
		console.log(self.data.sForm);
		self.setData({
			web_sForm: self.data.sForm
		})
	},

	changeBind(e) {
		const self = this;
		api.fillChange(e, self, 'submitData');
		console.log(self.data.submitData);
		self.setData({
			web_submitData: self.data.submitData
		})
		if (self.data.submitData.title != '') {
			console.log(666)
			self.data.searchItem.title = ['LIKE', ['%' + self.data.submitData.title + '%']],
				self.getMainData(true);
		} else {
			delete self.data.searchItem.title;
			console.log(666)
			self.getMainData(true)
		}
	},

	search() {
		const self = this;
		
	},


	getMainData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self)
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = api.cloneForm(self.data.searchItem);
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
					type: 2,
					user_no:wx.getStorageSync('info').user_no
				},
				condition: '='
			},
			relation: {
				tableName: 'Relation',
				middleKey: 'product_no',
				key: 'relation_one',
				searchItem: {
					status: 1,
					relation_two:wx.getStorageSync('info').user_no
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
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
			} else {
				self.data.isLoadAll = true;
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
		};
		api.messageGet(postData, callback);
	},

	onPullDownRefresh() {
		const self = this;
		wx.showNavigationBarLoading();
		delete self.data.searchItem.title;
		self.getMainData(true)
	},

	clickGood(e) {
		const self = this;
		api.buttonCanClick(self);
		var index = api.getDataSet(e, 'index');
		var item = self.data.mainData[index];
		self.addLog(index)
	},

	addLog(index) {
		const self = this;
		var item = self.data.mainData[index];
		const postData = {};
		postData.data = {
			type: 4,

			relation_id: self.data.mainData[index].id
		};
		postData.tokenFuncName = 'getProjectToken';
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.solely_code == 100000) {
				self.data.mainData[index].goodMe.push({
					status: 1,
					id: res.info.id
				});
				self.data.mainData[index].good.push({
					status: 1,
					id: res.info.id
				});
			} else {
				api.showToast(res.msg, 'none', 1000)
			};

			self.setData({
				web_mainData: self.data.mainData
			});
		};
		api.logAdd(postData, callback);
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
