import {
	Api
} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {
	Token
} from '../../utils/token.js';
const token = new Token();

Page({
	
	data: {
		isFirstLoadAllStandard:['getMainData']
	},
	
	onLoad() {
		const self = this;
		api.commonInit(self);
		self.getMainData()
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

			};
			console.log(self.data.mainData)
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
		};
		api.userInfoGet(postData, callback);
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
