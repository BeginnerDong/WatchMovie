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
		submitData: {
			title: '',
			type:1,
			content:'',
			mainImg:[],
			class:'',
			relation_id:'',
			product_no:''
		},
		stars: [2, 4, 6, 8, 10],
		urlSet:[],
		index:0,
		idArray:[],
		isFirstLoadAllStandard: ['getMainData'],
	},



	onLoad() {
		const self = this;

		api.commonInit(self);
		self.setData({
			web_stars:self.data.stars,	
		})
		self.getRelationMain();

	},




	changeBind(e) {
		const self = this;
		if (api.getDataSet(e, 'value')) {
			self.data.submitData[api.getDataSet(e, 'key')] = api.getDataSet(e, 'value');
		} else {
			api.fillChange(e, self, 'submitData');
		};
		self.setData({
			web_submitData: self.data.submitData,
		});
		console.log(self.data.submitData)
	},

	filmChange(e) {
		const self = this;
		console.log('picker发送选择改变，携带值为', e.detail.value)
		console.log(self.data.mainData[e.detail.value].id)
		self.data.submitData.relation_id = self.data.mainData[e.detail.value].id;
		self.data.submitData.product_no = self.data.mainData[e.detail.value].product_no;
		self.setData({
			web_index: e.detail.value,
			web_submitData: self.data.submitData
		})
		self.getRelation(e.detail.value)
	},

	getRelation(index) {
		const self = this;
		const postData = {};
		postData.searchItem = {
			relation_one:self.data.mainData[index].product_no,
			relation_two:wx.getStorageSync('info').user_no
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.relationData = res.info.data[0];
/* 				for (var i = 0; i < self.data.relationData.length; i++) {
					if(self.data.idArray.indexOf(self.data.relationData[i].relation_one)){
						self.data.idArray.push(self.data.relationData[i].relation_one)
					}
				} */
			};
			console.log(self.data.relationData)
			console.log(self.data.idArray)
			self.setData({
				web_relationData: self.data.relationData,
			});
		};
		api.relationGet(postData, callback);
	},
	
	getRelationMain() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			relation_two:wx.getStorageSync('info').user_no
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				for (var i = 0; i < res.info.data.length; i++) {
					if(self.data.idArray.indexOf(res.info.data[i].relation_one)){
						self.data.idArray.push(res.info.data[i].relation_one)
					}
				}
			};
			console.log(self.data.relationData)
			console.log(self.data.idArray)
			self.getMainData()
		};
		api.relationGet(postData, callback);
	},


	getMainData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			type:1,
			product_no:['in',self.data.idArray]
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data)
				/* self.data.submitData.relation_id = self.data.mainData[0].id */
			};
			console.log(self.data.mainData)
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
		};
		api.productGet(postData, callback);
	},


	submit() {
		const self = this;
		api.buttonCanClick(self);
		var phone = self.data.submitData.phone;
		const pass = api.checkComplete(self.data.submitData);
		console.log('pass', pass);
		console.log('self.data.submitData',self.data.submitData)
		if (pass) {		
				const callback = (user, res) => {
					self.resumeAdd();
				};
				api.getAuthSetting(callback);
		} else {
			api.buttonCanClick(self, true)
			api.showToast('请补全信息', 'none')
		};
	},

	upLoadImg() {
		const self = this;
		if (self.data.submitData.mainImg.length > 2) {
			api.showToast('仅限3张', 'fail');
			return;
		};
		wx.showLoading({
			mask: true,
			title: '图片上传中',
		});
		const callback = (res) => {
			console.log('res', res)
			if (res.solely_code == 100000) {

				self.data.submitData.mainImg.push({
					url: res.info.url
				})
				self.setData({
					web_submitData: self.data.submitData
				});
				wx.hideLoading()
			} else {
				api.showToast('网络故障', 'none')
			}
		};

		wx.chooseImage({
			count: 1,
			success: function(res) {
				console.log(res);
				var tempFilePaths = res.tempFilePaths;
				console.log(callback)
				api.uploadFile(tempFilePaths[0], 'file', {
					tokenFuncName: 'getProjectToken'
				}, callback)
			},
			fail: function(err) {
				wx.hideLoading();
			}
		})
	},

	previewImg(e){
		const self = this;
		var index = e.currentTarget.dataset.index;
		if(self.data.submitData.mainImg.length>0){
		  for(var i=0;i<self.data.submitData.mainImg.length;i++){
			  self.data.urlSet.push(self.data.submitData.mainImg[i].url);
		  }
		}
		console.log('self.data.submitData.mainImg',self.data.submitData.mainImg)
		wx.previewImage({
		  current: self.data.submitData.mainImg[index].url,
		  urls: self.data.urlSet,
		  success: function(res) {},
		  fail: function(res) {},
		  complete: function(res) {},
		})
	},


	delete(e) {
		const self = this;
		var index = api.getDataSet(e, 'index');
		console.log('deleteImg', index)
		self.data.submitData.mainImg.splice(index, 1);
		self.setData({
			web_submitData: self.data.submitData
		})
	},
	
	resumeAdd() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		if(!wx.getStorageSync('info')||!wx.getStorageSync('info').headImgUrl){
		  postData.refreshToken = true;
		};
		postData.data = {};
		postData.data = api.cloneForm(self.data.submitData);

		if(self.data.relationData.count>0){
			postData.saveAfter = [
				{
					tableName:'FlowLog',
					FuncName:'add',
					data:{
						count:wx.getStorageSync('info').thirdApp.custom_rule.remark,
						user_no:wx.getStorageSync('info').user_no,
						type:3,
						thirdapp_id:2,
						trade_info:'发布影评奖励'
					}
				},
				{
					tableName:'Relation',
					FuncName:'update',
					data:{
						count:self.data.relationData.count-1,
					},
					searchItem:{
						id:self.data.relationData.id
					}
				}
			]
		}
		const callback = (data) => {	
			if (data.solely_code == 100000) {
				api.showToast('发布成功', 'none', 1000)
					setTimeout(function() {
						wx.navigateBack({
							delta: 1
						})
					}, 1000);
			} else {
				api.showToast(data.msg, 'none', 1000)
			}

		};
		api.messageAdd(postData, callback);
	},


})
