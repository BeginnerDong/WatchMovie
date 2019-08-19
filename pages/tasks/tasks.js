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
		constantSignData:'',
		signReward:0,
		isFirstLoadAllStandard: ['getMainData', 'flowLogGet','initSignData'],
		is_show:false
	},


	onLoad(options) {

	},

	onShow() {
		const self = this;
		self.init()
	},

	init(){
		const self = this;
		api.commonInit(self);
		self.getMainData();
		self.flowLogGet();
		self.initSignData()
	},
	
	show(){
		const self= this;
		self.data.is_show = !self.data.is_show;		
		self.setData({
			is_show:self.data.is_show
		})
	},
	
	sign(){
		const self = this;
		if(self.data.buttonCanClick){
			api.buttonCanClick(self,false)
		}else{
			return;
		};
		console.log('pass')
		
		var dayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000;
		if(!self.data.isSign){
			var postData = {
				data:{
					type:3
				}
			};
			postData.tokenFuncName = 'getProjectToken';
			const callback = (res)=>{
				if(res.solely_code==100000){
					console.log('666')
					api.buttonCanClick(self,true)
					self.data.constantSignData.count++;
					self.data.constantSignData.time = dayStart;
					wx.setStorageSync('constantSignData',self.data.constantSignData);
					self.show()
				}else{
					api.buttonCanClick(self,true)
					wx.showToast({
						title: '签到失败',
						success:function(){
							setTimeout(function(){
								self.init();
							},1500)	
						}
					});
				};
				
			};
			if(parseInt((self.data.constantSignData.count+1)/7)*7==self.data.constantSignData.count){
				postData.saveAfter = [{
				  tableName:'FlowLog',
				  FuncName:'add',
				  data:{
				    count:self.data.signReward,
					user_no:wx.getStorageSync('info').user_no,
					type:3,
					thirdapp_id:2,
					trade_info:'签到奖励'
				  }
				}]
			};
			api.logAdd(postData, callback);
		}else{
			api.buttonCanClick(self,true)
			wx.showToast({
				title: '今日已经签到',
			});
			
		}
	},
	
	
	initSignData(){
		const self = this;
		var dayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000;
		var nowTime = (new Date()).getTime() / 1000;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			type: 3,
			create_time:['between',[dayStart,nowTime]]
		};
		const callback = (res)=>{
			if(res.info.data.length>0){
				self.data.isSign = true;
			};
			if(wx.getStorageSync('constantSignData')){
				self.data.constantSignData = wx.getStorageSync('constantSignData');
				if(dayStart - wx.getStorageSync('constantSignData').time>86400){
					self.data.constantSignData.count = 0;
					self.data.constantSignData.time = 0;
					wx.setStorageSync('constantSignData',self.data.constantSignData);
				};
				self.setData({
					web_isSign:self.data.isSign,
					web_signData:self.data.constantSignData
				});
			}else{
				self.signGet();
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'initSignData', self);
		};
		api.logGet(postData, callback);


		
		
	},

	signGet() {
		const self = this;
		
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			type: 3,
		};
		postData.order = {
			create_time:'desc'
		};
		const callback = (res) => {
			if (res.info.data) {
				var signData = {
					time:0,
					count:0
				};
				var dayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
				var pastTimeStap = 0;
				for (var i = 0; i < res.info.data.length; i++) {
					var timeStamp = (new Date(res.info.data[i].create_time.substring(0,10)+' 00:00')).getTime();
					if(pastTimeStap==0){
						if(timeStamp-dayStart==86400||timeStamp-dayStart==0){
							pastTimeStap = timeStamp;
							signData.time = pastTimeStap;
							signData.count++;
						}else{
							break;
						};
					}else if(pastTimeStap-timeStamp==86400){
						pastTimeStap = timeStamp;
						signData.count++;
					}else{
						break;
					};
				};
				self.data.constantSignData = signData;
				wx.setStorageSync('constantSignData',self.data.constantSignData);
				console.log('self.data.signData',self.data.constantSignData)
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'signGet', self);
			self.setData({
				web_signData:self.data.constantSignData
			})
		};
		api.logGet(postData, callback);
	},


	getMainData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no: wx.getStorageSync('info').user_no
		};

		postData.getAfter = {
			ThirdInfo:{
		        tableName:'ThirdApp',
		        middleKey:'thirdapp_id',
		        key:'id',
		        condition:'=',
		        searchItem:{
		          status:1
		        },
		    },
		};
		
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.mainData.info.score = parseInt(self.data.mainData.info.score)
				self.data.signReward = parseInt(self.data.mainData.ThirdInfo[0].custom_rule.sign)
			};
			self.setData({
				web_mainData: self.data.mainData,
				web_signReward: self.data.signReward
			});
			console.log('self.data.mainData', self.data.mainData);
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
		};

		api.userGet(postData, callback);
	},

	flowLogGet() {
		const self = this;
		var dayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime()/1000;
		var nowTime = (new Date()).getTime() / 1000;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no: wx.getStorageSync('info').user_no,
			type: 3,
			create_time: ['between', [dayStart, nowTime]],
			count: ['>', 0]
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
					web_count: self.data.count
				});
			};

			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'flowLogGet', self);
		};
		api.flowLogGet(postData, callback);
	},

	onShareAppMessage() {
		const self = this;
		return {
			title: '锦绣五月',
			path: 'pages/index/index?user_no=' + wx.getStorageSync('info').user_no,
			success: function(res) {
				console.log(res);
				console.log(parentNo)
				if (res.errMsg == 'shareAppMessage:ok') {
					console.log('分享成功')
					if (self.data.shareBtn) {
						if (res.hasOwnProperty('shareTickets')) {
							console.log(res.shareTickets[0]);
							self.data.isshare = 1;
						} else {
							self.data.isshare = 0;
						}
					}
				} else {
					wx.showToast({
						title: '分享失败',
					})
					self.data.isshare = 0;
				}
			},
			fail: function(res) {
				console.log(res)
			}
		}
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
