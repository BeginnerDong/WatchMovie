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
		isFirstLoadAllStandard: ['getMainData', 'getMessageData'],
		messageData: [],
		stars:[2,4,6,8,10]
	},


	onLoad(options) {
		const self = this;
		self.data.id = options.id;
		api.commonInit(self);
		self.getMainData();

	},
	
	intoCommentDetails(e){
		const self = this;
		var index = api.getDataSet(e,'index');
		console.log(index)
		if(self.data.messageData[index].relation.length==0){
			api.showToast('您没有观看此电影','none')
		}else{
			api.pathTo(api.getDataSet(e, 'path'), 'nav');
		}
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
				self.data.mainData.description = self.data.mainData.description.split(',');
				//self.data.mainData.product.end_time = api.timestampToTime(self.data.mainData.product.end_time);
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.getMessageData();
			self.setData({
				web_mainData: self.data.mainData,
			});
		};
		api.productGet(postData, callback);
	},


	getMessageData() {
		const self = this;
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			relation_id: self.data.mainData.id,
			user_type: 0,
			type: 1
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
		postData.compute = {
			TotalCount: [
				'sum',
				'class',
			],
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.messageData.push.apply(self.data.messageData, res.info.data);
				self.data.avr = Math.ceil(res.info.compute.TotalCount/res.info.total);
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMessageData', self);
			self.setData({
				web_avr:self.data.avr,
				web_messageData: self.data.messageData,
			});
			console.log(self.data.avr)
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
