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
		buttonCanClick: true
	},
	onLoad() {
		const self = this;
		self.setData({
			web_buttonCanClick: self.data.buttonCanClick
		})
	},

	scan(e) {
		const self = this;
		api.buttonCanClick(self);
		self.data.type=api.getDataSet(e,'type');
		wx.scanCode({
			success: (res) => {
				console.log(res)
				api.buttonCanClick(self, true);
				if (res.errMsg == "scanCode:ok") {
					self.getMainData(res.result)
				}
			},
			fail: (res) => {
				api.buttonCanClick(self, true);
			}
		})
	},

	getMainData(result) {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = {
			order_no:result,
			user_type: 0
		};
		postData.searchItem.pay_status = 1;
		const callback = (res) => {
			console.log('222', self.data.show)
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				 if(res.info.data[0].type!=self.data.type){
					 api.showToast('二维码类型错误', 'none');
				 }else if(res.info.data[0].type==1){
					 api.pathTo('/pages/picket/picket?order_no='+result,'nav')
				 }else{
					 api.pathTo('/pages/sanck/sanck?order_no='+result,'nav')
				 }
			} else {
				api.showToast('二维码无效', 'none', 2000, function() {			
				})
			};
		};
		api.orderGet(postData, callback);
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
