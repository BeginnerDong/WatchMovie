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
		isFirstLoadAllStandard: ['getMainData', 'getThreeData'],
		total: 0,
		submitData: {
			content: '',
			type: 2,
		},
		urlSet: [],
		threeData: []
	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.data.id = options.id;
		if (self.data.id) {
			self.getOriginData();
		} else {
			api.showToast('数据传递有误', 'none', 2000, function() {
				setTimeout(function() {
					wx.navigateBack({
						delta: 1
					})
				}, 2000)
			})
		};
	},

	previewImg(e) {
		const self = this;
		var index = e.currentTarget.dataset.index;
		if (self.data.originData.mainImg.length > 0) {
			for (var i = 0; i < self.data.originData.mainImg.length; i++) {
				self.data.urlSet.push(self.data.originData.mainImg[i].url);
			}
		}
		console.log('self.data.originData.mainImg', self.data.originData.mainImg)
		wx.previewImage({
			current: self.data.originData.mainImg[index].url,
			urls: self.data.urlSet,
			success: function(res) {},
			fail: function(res) {},
			complete: function(res) {},
		})
	},


	getOriginData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			id: self.data.id,
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
				condition: '=',
				searchItem: {
					status: 1
				},
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
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.originData = res.info.data[0];
				self.getMainData();
				self.getThreeData()
			} else {
				api.showToast('数据错误', 'none', 1000);
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getOriginData', self);
			self.setData({
				web_originData: self.data.originData,
			});
		};
		api.messageGet(postData, callback);
	},


	getThreeData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self)
		};
		const postData = {};
		postData.paginate = {
			count: 0,
			currentPage: 1,
			pagesize: 3,
			is_page: true
		}
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			type: 2,
			user_type: 0,
			relation_id: self.data.id,
			score: ['>', 0]
		};
		postData.getAfter = {

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
			score: 'desc'
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.threeData.push.apply(self.data.threeData, res.info.data);

			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getThreeData', self);
			self.setData({
				web_threeData: self.data.threeData
			});
		};
		api.messageGet(postData, callback);
	},



	getMainData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self)
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			type: 2,
			user_type: 0,
			relation_id: self.data.id
		};
		postData.getAfter = {

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
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
				self.data.total = res.info.total;
			} else {
				self.data.isLoadAll = true;
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_total: self.data.total,
				web_mainData: self.data.mainData,
			});
		};
		api.messageGet(postData, callback);
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
	
	send(){
		const self = this;
		console.log(11)
		if ( self.data.submitData.content == "" ){
			api.showToast('不能发空评论', 'none')
		}else{
			self.messageAdd()
		}
		
		/* if (new RegExp("^[ ]+$").test(self.data.submitData.content)) {
			console.log(22)
			api.showToast('不能发空评论', 'none')
			return;
		}; */
		
	},

	messageAdd() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		/*if(!wx.getStorageSync('info')||!wx.getStorageSync('info').headImgUrl){
		  postData.refreshToken = true;
		};*/
		postData.data = {};
		postData.data = api.cloneForm(self.data.submitData);
		postData.data.relation_id = self.data.id;

		const callback = (data) => {
			api.buttonCanClick(self, true)
			if (data.solely_code == 100000) {
				self.data.submitData.content = '';
				self.setData({
					web_submitData: self.data.submitData
				});
				self.getMainData(true)
			} else {
				api.showToast(data.msg, 'none', 1000)
			}

		};
		api.messageAdd(postData, callback);
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
		postData.saveAfter = [{
			tableName: 'Message',
			FuncName: 'update',
			data: {
				score: self.data.mainData[index].score + 1
			},
			searchItem: {
				id: self.data.mainData[index].id
			}
		}]
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

	clickGoodTwo(e) {
		const self = this;
		api.buttonCanClick(self);
		var index = api.getDataSet(e, 'index');
		var item = self.data.threeData[index];
		self.addLogTwo(index)
	},

	addLogTwo(index) {
		const self = this;
		var item = self.data.threeData[index];
		const postData = {};
		postData.data = {
			type: 4,

			relation_id: self.data.threeData[index].id
		};
		postData.tokenFuncName = 'getProjectToken';
		postData.saveAfter = [{
			tableName: 'Message',
			FuncName: 'update',
			data: {
				score: self.data.threeData[index].score + 1
			},
			searchItem: {
				id: self.data.threeData[index].id
			}
		}]
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.solely_code == 100000) {
				self.data.threeData[index].goodMe.push({
					status: 1,
					id: res.info.id
				});
				self.data.threeData[index].good.push({
					status: 1,
					id: res.info.id
				});
			} else {
				api.showToast(res.msg, 'none', 1000)
			};

			self.setData({
				web_threeData: self.data.threeData
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
