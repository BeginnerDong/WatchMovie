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
		is_show: false,
		isFirstLoadAllStandard: ['getMainData','getUserInfoData'],
		hasMainData: [],
		noMainData: []
	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		
		self.getUserInfoData()
	},
	
	onShow(){
		const self = this;
		self.getMainData(true);
	},
	
	getUserInfoData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no: wx.getStorageSync('info').user_no
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.userInfoData = res.info.data[0];
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getUserInfoData', self);
		};
		api.userInfoGet(postData, callback);
	},

	show() {
		const self = this;
		self.data.is_show = !self.data.isShow;
		self.setData({
			is_show: self.data.is_show
		})
	},

	submit() {
		const self = this;
		api.buttonCanClick(self);
		if (parseInt(self.data.userInfoData.score) > 1) {
			const callback = (user, res) => {
				self.addFlowLog();
			};
			api.getAuthSetting(callback);
		} else {
			api.buttonCanClick(self, true)
			api.showToast('锦绣劵不足', 'none')
		};
	},



	addFlowLog() {
		const self = this;

		const postData = {};
		postData.data = {
			count: -1,
			user_no: wx.getStorageSync('info').user_no,
			type: 3,
			thirdapp_id: 2,
			trade_info: '翻牌子'
		};
		postData.tokenFuncName = 'getProjectToken';
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.solely_code == 100000) {
				self.show();
				api.pathTo('/pages/whoDrawTwo/whoDrawTwo', 'nav')
			} else {
				api.showToast(res.msg, 'none', 1000)
			};
		};
		api.flowLogAdd(postData, callback);
	},

	getMainData(isNew) {
		const self = this;
		if(isNew){
			api.clearPageIndex(self)
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			relation_user: wx.getStorageSync('info').user_no,
			user_type: 0,
			type:2
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
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				for (var i = 0; i < res.info.data.length; i++) {
					res.info.data[i].user[0].info.birthday = res.info.data[i].user[0].info.birthday.substring(2, 4);
					if (res.info.data[i].behavior == 0) {
						console.log(222)
						self.data.noMainData.push(res.info.data[i])
					} else if (res.info.data[i].behavior == 1) {
						self.data.hasMainData.push(res.info.data[i])
					}
				}
			} else {
				self.data.isLoadAll = true;
			}
			console.log('self.data.noMainData', self.data.noMainData)
			console.log('self.data.hasMainData', self.data.hasMainData)
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_noMainData: self.data.noMainData,
				web_hasMainData: self.data.hasMainData,
			});
		};
		api.logGet(postData, callback);
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
