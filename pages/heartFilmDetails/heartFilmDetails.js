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
		isFirstLoadAllStandard: ['getMainData']
	},


	onLoad(options) {
		const self = this;
		self.data.id = options.id;
		api.commonInit(self);
		self.getMainData();
	},



	getMainData() {
		const self = this;
		const postData = {};
		
		postData.searchItem = {
			id: self.data.id
		};
		postData.getAfter = {
			art: {
				tableName: 'CastList',
				middleKey: 'product_no',
				key: 'product_no',
				searchItem: {
					status: 1
				},
				condition: '='
			},
			heart: {
				token:wx.getStorageSync('token'),
				tableName: 'Log',
				middleKey: 'id',
				key: 'relation_id',
				searchItem: {
					status: 1,
					type:1,
					user_type:0,	
					relation_table:'product'
				},
				condition: '=',
				compute: {
					num: ['count', 'count', {
						status: 1,
						type:1,
						relation_table:'product'
					}]
				}
			},
			heartMe: {
				token:wx.getStorageSync('token'),
				tableName: 'Log',
				middleKey: 'id',
				key: 'relation_id',
				searchItem: {
					status: 1,
					type:1,
					user_no:wx.getStorageSync('info').user_no,
					relation_table:'product'
				},
				condition: '=',
			}
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.mainData.description = self.data.mainData.description.split(',');
				self.data.mainData.end_time = api.timestampToTime(self.data.mainData.end_time);
				self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
				self.data.mainData.percent = (100/(self.data.mainData.stock+100))*(self.data.mainData.heart.num+100);
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
			console.log(100/(self.data.mainData.stock+100))
		};
		api.productGet(postData, callback);
	},

	submit() {
		const self = this;
		api.buttonCanClick(self);
		if(self.data.mainData.heartMe.length>0){
			api.buttonCanClick(self,true);
			api.showToast('您已经心动过','none');
			return
		};
		const callback = (user, res) => {
			self.addLog();
		};
		api.getAuthSetting(callback);
	},

	addLog(index) {
		const self = this;
		const postData = {};
		postData.data = {
			type: 1,
			relation_id: self.data.mainData.id,
			relation_table:'product'
		};
		postData.tokenFuncName = 'getProjectToken';
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.solely_code == 100000) {
				api.showToast('心动成功','none')
				self.data.mainData.heartMe.push({
					status: 1,
					id: res.info.id
				});
				self.data.mainData.heart.num += 1;
				self.data.mainData.percent = (100/(self.data.mainData.stock+100))*(self.data.mainData.heart.num+100);
			} else {
				api.showToast(res.msg, 'none', 1000)
			};
			self.setData({
				web_mainData: self.data.mainData
			});
		};
		api.logAdd(postData, callback);
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
