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
		mainData: {},
		isFirstLoadAllStandard: ['getMainData','flowLogGet']
	},


	onLoad(options) {

	},

	onShow() {
		const self = this;
		self.getMainData();
		self.flowLogGet()
	},

	getMainData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no: wx.getStorageSync('info').user_no
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.mainData.info.score = parseInt(self.data.mainData.info.score)
			};
			self.setData({
				web_mainData: self.data.mainData
			})
			console.log('self.data.mainData',self.data.mainData)
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
		};
		api.userGet(postData, callback);
	},

	flowLogGet() {
		const self = this;
		var dayStart =  new Date(new Date().setHours(0, 0, 0, 0)).getTime()/1000;
		var nowTime = (new Date()).getTime()/1000; 
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no: wx.getStorageSync('info').user_no,
			type:3,
			create_time:['between',[dayStart,nowTime]],
			count:['>',0]
		};
		postData.compute = {
				TotalCount: [
					'sum',
					'count',
				],
			}; 
		const callback = (res) => {
			if (res) {
				self.data.count = res.info.compute.TotalCount;
				self.setData({
					web_count:self.data.count
				});
			};
			
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'flowLogGet', self);
		};
		api.flowLogGet(postData, callback);
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
