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
		isFirstLoadAllStandard: ['getMainData', 'getMessageData'],
		messageData:[]
	},


	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.data.user_no = options.user_no;
		self.getMainData();
		self.getMessageData()
	},



	getMainData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no: self.data.user_no,
			user_type: 0
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.mainData.info.birthday = self.data.mainData.info.birthday.substring(2, 3);
			};
			self.setData({
				web_mainData: self.data.mainData
			})
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
		};
		api.userGet(postData, callback);
	},

	getMessageData() {
		const self = this;
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no:self.data.user_no,
			user_type: 0,
			type:1
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
		};
		postData.order = {
			create_time:'desc'
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				//self.data.messageData.push.apply(self.data.messageData, res.info.data);
				for (var i = 0; i < res.info.data.length; i++) {
					if(self.data.messageData.length>0){
						if(res.info.data[i].create_time.substring(5,7)==self.data.messageData[self.data.messageData.length-1].month&&
						res.info.data[i].create_time.substring(8,10)==self.data.messageData[self.data.messageData.length-1].day){
							self.data.messageData[self.data.messageData.length-1].data.push(res.info.data[i]);
						}else{
							self.data.messageData.push({
								month: res.info.data[i].create_time.substring(5,7),
								day:res.info.data[i].create_time.substring(8,10),
								data:[res.info.data[i]]
							});
						};
					}else{
						self.data.messageData.push({
							month: res.info.data[i].create_time.substring(5,7),
							day:res.info.data[i].create_time.substring(8,10),
							data:[res.info.data[i]]
						})
					};
				};
			};
			console.log('self.data.messageData',self.data.messageData)
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


	onReachBottom() {
		const self = this;
		if (!self.data.isLoadAll && self.data.buttonCanClick) {
			self.data.paginate.currentPage++;
			self.getMessageData();
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
