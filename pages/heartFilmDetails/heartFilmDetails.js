import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
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
		 isFirstLoadAllStandard:['getMainData']
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
			 id:self.data.id
		};
		postData.getAfter = {
			art:{
				tableName:'CastList',
				middleKey:'product_no',
				key:'product_no',
				searchItem:{
					status:1
				},
				condition:'='
			}
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.mainData.description = self.data.mainData.description.split(',');
				self.data.mainData.end_time = api.timestampToTime(self.data.mainData.end_time);
				self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
		};
		api.productGet(postData, callback);
	},
	
  intoPathRedirect(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },
  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  }
	})
