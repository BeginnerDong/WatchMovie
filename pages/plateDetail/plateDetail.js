//logs.js
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
		mainData: [],
		isFirstLoadAllStandard: ['getMainData'],
	},

	onLoad(options) {
		const self = this;
		console.log(options)
		self.data.id = options.id;
		api.commonInit(self);
		self.getMainData();
	},

	getMainData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
		};
		postData.getBefore = {
			caseData: {
				tableName: 'Label',
				searchItem: {
					title: ['=', ['平台说明']],
				},
				middleKey: 'menu_id',
				key: 'id',
				condition: 'in',
			}
		};
		const callback = (res) => {
			api.buttonCanClick(self,true);
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
			
		};
		api.articleGet(postData, callback);
	},

	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},


})
