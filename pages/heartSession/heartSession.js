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
		mainData:[],
		isFirstLoadAllStandard:['getMainData']

	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.getMainData();
	},



	getMainData() {
		const self = this;
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			type: 1
		};
		postData.getAfter = {
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
						user_type:0,	
						relation_table:'product'
					}]
				}
			}
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
				for (var i = 0; i < self.data.mainData.length; i++) {
					self.data.mainData[i].description = self.data.mainData[i].description.split(',');
					self.data.mainData[i].end_time = api.timestampToTime(self.data.mainData[i].end_time);
					var percent =  Math.ceil(self.data.mainData[i].heart.num+100/(self.data.mainData[i].stock+100)*100);

					percent = Math.round(percent/10)*10;
					if(percent==0){
						percent = 1;
					};
					self.data.mainData[i].heart_url = "/image/cardiac-"+percent+".png"
				};
			}else{
				self.data.isLoadAll = true;
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
		};
		api.productGet(postData, callback);
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
